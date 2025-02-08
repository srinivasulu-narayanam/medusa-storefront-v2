

import { Button } from "@medusajs/ui"
import Spinner from "@modules/common/icons/spinner"
import React, { useCallback, useEffect, useState } from "react"
import  {useRazorpay, RazorpayOrderOptions } from "react-razorpay"
import { HttpTypes } from "@medusajs/types"
import { placeOrder } from "@lib/data/cart"
import { CurrencyCode } from "react-razorpay/dist/constants/currency"

export const RazorpayPaymentButton = ({
  session,
  notReady,
  cart
}: {
  session: HttpTypes.StorePaymentSession
  notReady: boolean
  cart: HttpTypes.StoreCart
}) => {
  const [disabled, setDisabled] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | undefined>(undefined)
  const {Razorpay} = useRazorpay();


  console.log({session})
  // const [orderData,setOrderData] = useState({id:""})

  const orderData = session.data as Record<string, string>
  const onPaymentCompleted = async () => {
    await placeOrder().catch(() => {
      setErrorMessage("An error occurred, please try again.")
      setSubmitting(false)
    })
  }
  // useEffect(()=>{
  //       setOrderData(session.data as {id:string})
  //     },[session.data])


  console.log({orderData})

  const handlePayment = useCallback(async () => {
    console.log("Click")
    const onPaymentCancelled = async () => {
            // await cancelOrder(session.provider_id).catch(() => {
              setErrorMessage("PaymentCancelled")
            //   setSubmitting(false)
            // })
          }
    const options: RazorpayOrderOptions = {
      // callback_url: `${process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL}/razorpay/hooks`,
      callback_url: `https://shop.flinkk.io/razorpay/hooks`,

      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY ?? '',
      amount: session.amount,
      order_id: orderData.id,
      currency: cart.currency_code.toUpperCase() as CurrencyCode,
      name: process.env.COMPANY_NAME ?? "Flinkk",
      description: `Order number ${orderData.id}`,
      remember_customer:true,

      image: "https://example.com/your_logo",
      modal: {
        backdropclose: true,
        escape: true,
        handleback: true,
        confirm_close: true,
        ondismiss: async () => {
          setSubmitting(false)
          setErrorMessage(`payment cancelled`)
          await onPaymentCancelled()
        },
        animation: true,
      },
      handler: async (args) => {
        onPaymentCompleted()
      },
      "prefill": {
        "name": cart?.billing_address?.first_name + " " + cart?.billing_address?.last_name,
        "email": cart?.email,
        "contact": (cart?.shipping_address?.phone) ?? undefined
      },
      "notes": session.data.notes as string,
      
    };

    const razorpay = new Razorpay(options);
    if(orderData.id)
      console.log("yet to open")
    razorpay.open();
    console.log("===========> yet to complete open")

    razorpay.on("payment.failed", function (response: any) {
      setErrorMessage(JSON.stringify(response.error))
   
    })
   razorpay.on("payment.authorized" as any, function (response: any) {
    const authorizedCart = placeOrder().then(authorizedCart=>{
    JSON.stringify(`authorized:`+ authorizedCart)
    })
    })
    // razorpay.on("payment.captured", function (response: any) {

    // }
    // )
  }, [Razorpay, cart.billing_address?.first_name, cart.billing_address?.last_name, cart.currency_code, cart?.email, cart?.shipping_address?.phone, orderData.id, session.amount, session.provider_id]);
  return (
    <>
      <Button
        disabled={submitting || notReady}
        onClick={() => handlePayment()}
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