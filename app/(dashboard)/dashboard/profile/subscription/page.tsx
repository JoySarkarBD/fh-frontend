import SubscriptionContent from "@/components/dashboard/subscription/SubscriptionContent";
import BillingHistory from "@/components/dashboard/subscription/BillingHistory";

export default function UserSubscriptionPage() {
  return (
    <div>
      <h1 className='text-2xl font-semibold mb-6'>Subscription Plan</h1>

      <div id='plans' className='mb-6'>
        <SubscriptionContent />
      </div>

      <div id='billing'>
        <h2 className='text-xl font-semibold mb-3 border-b-2 border-gray-300 pb-2'>
          Billing
        </h2>
        <BillingHistory />
      </div>
    </div>
  );
}
