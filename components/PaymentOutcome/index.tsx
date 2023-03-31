import { useSubscription } from "@galoymoney/client"
import { useRouter } from "next/router"
import React from "react"
import Image from "react-bootstrap/Image"

import useSatPrice from "../../lib/use-sat-price"
import { ACTIONS, ACTION_TYPE } from "../../pages/_reducer"
import { formatOperand } from "../../utils/utils"
import styles from "./payment-outcome.module.css"

interface Props {
  paymentRequest: string
  paymentAmount: string | string[] | undefined
  dispatch: React.Dispatch<ACTION_TYPE>
}

function PaymentOutcome({ paymentRequest, paymentAmount, dispatch }: Props) {
  const router = useRouter()
  const { amount, unit, sats } = router.query
  const { satsToUsd } = useSatPrice()

  if (!paymentRequest) {
    return null
  }

  const { loading, data, error, errorsMessage } = useSubscription.lnInvoicePaymentStatus({
    variables: {
      input: { paymentRequest },
    },
  })

  if (data !== undefined) {
    if (error) console.error(error)
  }

  const backToCashRegisterButton = (
    <button
      className={styles.back_btn}
      onClick={() => dispatch({ type: ACTIONS.CREATE_NEW_INVOICE })}
    >
      <Image
        src="/icons/cash-register-icon.svg"
        alt="cash register icon"
        width="18"
        height="18"
      />
      돌아가기
    </button>
  )

  if (data) {
    const { status, errors } = data.lnInvoicePaymentStatus
    if (status === "PAID") {
      const usdValueInSatUnit =
        satsToUsd(Number(paymentAmount)) < 1
          ? "less than a cent"
          : `$${satsToUsd(Number(paymentAmount)).toFixed(2)}`
      return (
        <div className={styles.container}>
          <div aria-labelledby="Payment successful">
            <Image
              src="/icons/success-icon.svg"
              alt="success icon"
              width="104"
              height="104"
            />
            <p className={styles.text}>
              {/* {unit === "SAT"
                ? `${formatOperand(
                    paymentAmount?.toString(),
                  )} 사토시`
                : `${formatOperand(
                    sats?.toString() ?? Number(paymentAmount).toFixed(),
                  )} 사토시`}{" "} */}
              결제 완료
            </p>
          </div>
          {backToCashRegisterButton}
        </div>
      )
    }
    if (errors.length > 0 || errorsMessage) {
      return (
        <div className={styles.container}>
          <div aria-labelledby="Payment unsuccessful">
            <Image
              src="/icons/cancel-icon.svg"
              alt="success icon"
              width="104"
              height="104"
            />
            {/* <p className={styles.text}>
              Please try again. Either the invoice has expired or it hasn’t been paid.
            </p> */}
            <p className={styles.text}>
              다시 시도해주세요. 인보이스가 만료됐습니다.
            </p>
          </div>
          {backToCashRegisterButton}
        </div>
      )
    }
  }
  return <>{loading && null}</>
}

export default PaymentOutcome
