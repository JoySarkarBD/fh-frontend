"use client";

import { Check } from "lucide-react";

import SubscriptionButton from "./SubscriptionButton";
import { useEffect, useState } from "react";
import axiosClient from "@/lib/axiosClient";

export default function SubscriptionContent() {
  const [isSubscribed, setIsSubscribed] = useState(false);

  useEffect(() => {
    // Fetch user subscription status
    axiosClient
      .get("/users/me")
      .then((res) => {
        setIsSubscribed(!!res.data?.data?.isSubscribed);
      })
      .catch(() => setIsSubscribed(false));
  }, []);

  const subscriptionData = [
    {
      plan: "Free Plan",
      type: "Starter",
      price: "$0",
      priceType: "",
      description:
        "Perfect for new users, early-stage buyers, and casual visitors.",
      buttonText: isSubscribed ? "Switch to Free" : "Free Plan",
      status: !isSubscribed ? "active" : "inactive",
      features: [
        "Public property browsing (Buy/Rent)",
        "Basic property search and filters",
        "Save up to 5 properties to favorites",
        "Limited dashboard access",
        "Pulse Check Wizard & role assignment",
        "Basic document storage (up to 5 documents)",
        "Read-only access to blog and educational content",
        "Vendor directory (view-only)",
        "Limited service booking (pay-per-service)",
        "Standard email support",
      ],
    },
    {
      plan: "Premium",
      type: "Elite/Concierge",
      price: "$99",
      priceType: "Life Time",
      description:
        "Perfect for new users, early-stage buyers, and casual visitors",
      buttonText: isSubscribed ? "Current Plan" : "Get Started",
      status: isSubscribed ? "active" : "inactive",
      features: [
        "Unlimited saved properties",
        "All premium services and Messaging",
        "Full role-based dashboard experience",
        "Buyer, Seller, and Homeowner journey trackers",
        "Pulse Check Wizard & role assignment",
        "Financial readiness score & calculators",
        "Unlimited document storage",
        "Document sharing, annotations, and version history",
        "Automated reminders (deadlines, inspections, renewals)",
        "Priority customer support",
      ],
    },
  ];

  return (
    <div className='lg:pr-35'>
      <p className='flex md:hidden text-2xl mb-4 text-center items-center justify-center font-semibold text-(--primary)'>
        Subscription Plan
      </p>
      <div className='grid grid-cols-1 md:grid-cols-2 gap-9'>
        {subscriptionData.map((subscription, index) => (
          <div
            key={index}
            className=' mb-8 p-4 md:p-6 border border-[#D1E3D9] hover:bg-[#F8FAF9] hover:border-(--primary) rounded-lg shadow-sm transition-colors duration-200 '>
            <h2 className='text-2xl '>{subscription.plan}</h2>
            <p className='text-xs mb-3'>{subscription.type}</p>

            <div className='mt-7'>
              <p className='text-5xl'>
                {subscription.price}
                <span className='text-base text-[#70706C]'>
                  {subscription.priceType && ` / ${subscription.priceType}`}
                </span>
              </p>
              <p className='text-sm mt-2 text-[#70706C]'>
                {subscription.description}
              </p>
            </div>
            <div className='my-6 md:my-9'>
              <SubscriptionButton
                status={subscription.status}
                text={subscription.buttonText}
                disabled={isSubscribed && subscription.plan === "Premium"}
              />
            </div>

            <div className=''>
              <p className='text-(--primary-text-color) text-2xl'>
                What’s included:
              </p>
              <ul className='list-inside mt-4 space-y-1'>
                {subscription.features.map((feature, idx) => (
                  <li
                    key={idx}
                    className='text-[#70706C] text-sm flex items-center gap-1'>
                    <Check
                      size={16}
                      className='inline-block mr-2 text-(--primary)'
                    />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
