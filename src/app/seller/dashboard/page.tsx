import { redirect } from 'next/navigation';

export default function SellerDashboardRoot() {
  redirect('/seller/dashboard/queue');
}
