import { Button } from "@medusajs/ui"
import Spinner from "@modules/common/icons/spinner"
import React, { useCallback, useState } from "react"
import  { useRazorpay, RazorpayOrderOptions } from "react-razorpay"
import { placeOrder } from "@lib/data/cart"
import { HttpTypes } from "@medusajs/types"
import { CurrencyCode } from "react-razorpay/dist/constants/currency"

export const RazorpayPaymentButton = ({
  session,
  notReady,
  cart
}: {
  session: any
  notReady: boolean
  cart: HttpTypes.StoreCart
}) => {
  const [disabled, setDisabled] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | undefined>(undefined)

  // Use useRazorpay hook to get the Razorpay constructor
  const { Razorpay, error: razorpayError, isLoading } = useRazorpay(); 

  const orderData = session.data as Record<string, string>
  
  const onPaymentCompleted = async () => {
    await placeOrder().catch(() => {
      setErrorMessage("An error occurred, please try again.")
      setSubmitting(false)
    })
  }

  const handlePayment = useCallback(() => {
    if (razorpayError) {
      setErrorMessage(razorpayError);
      return;
    }

    const options: RazorpayOrderOptions = {
      callback_url: `${process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL}/razorpay/hooks`,
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY ?? '',
      amount: Number(session.amount * 100),
      order_id: orderData.id,
      currency: cart?.region?.currency_code.toLocaleUpperCase() as CurrencyCode ?? "INR",
      name: process.env.COMPANY_NAME ?? "CampEd",
      description: `Order number ${orderData.id}`,
      image: "https://example.com/your_logo",
      modal: {
        backdropclose: true,
        escape: true,
        handleback: true,
        confirm_close: true,
        ondismiss: () => {
          setSubmitting(false)
        },
        animation: true,
      },
      handler: async (args) => {
        onPaymentCompleted()
      },
      prefill: {
        name: `${cart?.billing_address?.first_name} ${cart?.billing_address?.last_name}`,
        email: cart?.email,
        contact: cart?.shipping_address?.phone ?? undefined
      },
      notes: `Address: ${cart?.billing_address}, Order Notes: ${session.data.notes}`,
    };

    const razorpayInstance = new Razorpay(options); // Create Razorpay instance from the constructor
    razorpayInstance.open();
    razorpayInstance.on("payment.failed", function (response: any) {
      setErrorMessage(JSON.stringify(response.error))
    })
  }, [Razorpay, razorpayError]);

  return (
    <>
      <Button
        disabled={submitting || notReady || isLoading}  // Disable button if Razorpay is still loading
        onClick={handlePayment}
      >
        {submitting ? <Spinner /> : "Checkout"}
      </Button>
      {errorMessage && (
        <div className="text-red-500 text-small-regular mt-2">
          {errorMessage}
        </div>
      )}
    </>
  )
}

