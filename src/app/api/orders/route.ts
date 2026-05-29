import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAuthConfig, isBodyTooLarge } from '@/lib/supabaseAuthServer';

export const dynamic = 'force-dynamic';

type OrderPayload = {
  sellerId?: unknown;
  items?: unknown;
};

type SubmittedOrderItem = {
  item_name: string;
  quantity: number;
  unit_price: number;
};

function getBearerToken(request: NextRequest): string {
  const header = request.headers.get('authorization') ?? '';
  const [scheme, token] = header.split(' ');
  if (scheme?.toLowerCase() !== 'bearer' || !token) {
    throw new Error('Missing customer session.');
  }
  return token;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function normalizeOrderItems(value: unknown): SubmittedOrderItem[] {
  if (!Array.isArray(value) || value.length === 0 || value.length > 20) {
    throw new Error('Add between 1 and 20 order items.');
  }

  return value.map((entry) => {
    if (!isRecord(entry)) {
      throw new Error('Each order item must include a name, quantity, and unit price.');
    }

    const itemName = typeof entry.itemName === 'string' ? entry.itemName.trim() : '';
    const quantity = Number(entry.quantity);
    const unitPrice = Number(entry.unitPrice);

    if (itemName.length < 1 || itemName.length > 80) {
      throw new Error('Order item names must be 1 to 80 characters.');
    }

    if (!Number.isInteger(quantity) || quantity < 1 || quantity > 99) {
      throw new Error('Order item quantities must be between 1 and 99.');
    }

    if (!Number.isFinite(unitPrice) || unitPrice < 0 || unitPrice > 9999.99) {
      throw new Error('Order item prices must be valid.');
    }

    return {
      item_name: itemName,
      quantity,
      unit_price: Number(unitPrice.toFixed(2)),
    };
  });
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  if (isBodyTooLarge(request.headers.get('content-length'))) {
    return NextResponse.json({ error: 'Request body is too large.' }, { status: 413 });
  }

  let payload: OrderPayload;
  try {
    payload = (await request.json()) as OrderPayload;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON payload.' }, { status: 400 });
  }

  if (typeof payload.sellerId !== 'string' || !payload.sellerId.trim()) {
    return NextResponse.json({ error: 'Seller is required.' }, { status: 400 });
  }

  let items: SubmittedOrderItem[];
  try {
    items = normalizeOrderItems(payload.items);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Invalid order items.' },
      { status: 400 },
    );
  }

  try {
    const accessToken = getBearerToken(request);
    const { url, anonKey } = getSupabaseAuthConfig();

    const rpcResponse = await fetch(`${url}/rest/v1/rpc/create_customer_order`, {
      method: 'POST',
      headers: {
        apikey: anonKey,
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        p_seller_id: payload.sellerId.trim(),
        p_items: items,
      }),
      cache: 'no-store',
    });

    const rpcBody = (await rpcResponse.json().catch(() => null)) as string | { message?: string } | null;
    if (!rpcResponse.ok) {
      const message = typeof rpcBody === 'object' && rpcBody?.message ? rpcBody.message : 'Unable to place order.';
      return NextResponse.json({ error: message }, { status: 400 });
    }

    return NextResponse.json({ orderId: typeof rpcBody === 'string' ? rpcBody : '' }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to place order.';
    const status = message === 'Missing customer session.' ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
