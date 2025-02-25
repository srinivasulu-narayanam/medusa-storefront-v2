"use client"

import { Button, clx, Heading, Text } from "@medusajs/ui"
import { CheckCircleSolid } from "@medusajs/icons"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useCallback, useState } from "react"
import Divider from "../../../common/components/divider"
import Input from "../../../common/components/input"
import NativeSelect from "../../../common/components/native-select"
import { capitalize } from "lodash"
import { updateSubscriptionData } from "../../../../lib/data/cart"

export enum SubscriptionInterval {
    DAILY = "daily",
    WEEKLY = "weekly",
    MONTHLY = "monthly",
    YEARLY = "yearly"
}

const SubscriptionForm = () => {
  const [interval, setInterval] = useState<SubscriptionInterval>(
    SubscriptionInterval.MONTHLY
  )
  const [period, setPeriod] = useState(1)
  const [isLoading, setIsLoading] = useState(false)

  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  const isOpen = searchParams.get("step") === "subscription"

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams)
      params.set(name, value)

      return params.toString()
    },
    [searchParams]
  )

  const handleEdit = () => {
    router.push(pathname + "?" + createQueryString("step", "subscription"), {
      scroll: false,
    })
  }

  const handleSubmit = async () => {
    setIsLoading(true)
    
    updateSubscriptionData(interval, period)
    .then(() => {
      setIsLoading(false)
      router.push(pathname + "?step=delivery", { scroll: false })
    })
  }

  return (
    <div className="bg-white">
      <div className="flex flex-row items-center justify-between mb-6">
        <Heading
          level="h2"
          className={clx(
            "flex flex-row text-3xl-regular gap-x-2 items-baseline",
            {
              "opacity-50 pointer-events-none select-none":
                !isOpen,
            }
          )}
        >
          Subscription Details
          {!isOpen && <CheckCircleSolid />}
        </Heading>
        {!isOpen && (
          <Text>
            <button
              onClick={handleEdit}
              className="text-ui-fg-interactive hover:text-ui-fg-interactive-hover"
              data-testid="edit-payment-button"
            >
              Edit
            </button>
          </Text>
        )}
      </div>
      <div>
        <div className={isOpen ? "block" : "hidden"}>
          <NativeSelect 
            placeholder="Interval" 
            value={interval} 
            onChange={(e) => 
              setInterval(e.target.value as SubscriptionInterval)
            }
            required
            autoComplete="interval"
          >
            {Object.values(SubscriptionInterval).map(
              (intervalOption, index) => (
                <option key={index} value={intervalOption}>
                  {capitalize(intervalOption)}
                </option>
              )
            )}
          </NativeSelect>
          <Input
            label="Period"
            name="period"
            autoComplete="period"
            value={period}
            onChange={(e) => 
              setPeriod(parseInt(e.target.value))
            }
            required
            type="number"
          />

          <Button
            size="large"
            className="mt-6"
            onClick={handleSubmit}
            isLoading={isLoading}
            disabled={!interval || !period}
          >
            Continue to review
          </Button>
        </div>
      </div>
      <Divider className="mt-8" />
    </div>
  )
}

export default SubscriptionForm