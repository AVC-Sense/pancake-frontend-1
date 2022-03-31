import avc20ABI from 'config/abi/AVC20.json'
import { useCallback, useMemo, useState } from 'react'
import { currencyEquals, Trade } from '@pancakeswap/sdk'

import {
  Button,
  Text,
  ArrowDownIcon,
  Box,
  useModal,
  Flex,
  IconButton,
  BottomDrawer,
  useMatchBreakpoints,
  ArrowUpDownIcon,
  Skeleton,
  InjectedModalProps,
} from '@pancakeswap/uikit'
import useActiveWeb3React from '../../../hooks/useActiveWeb3React'

/*
import TransactionConfirmationModal, {
  ConfirmationModalContent,
  TransactionErrorContent,
} from 'components/TransactionConfirmationModal'
*/

/**
 * Returns true if the trade requires a confirmation of details before we can submit it
 * @param tradeA trade A
 * @param tradeB trade B
 */
/*
function tradeMeaningfullyDiffers(tradeA: Trade, tradeB: Trade): boolean {
  return (
    tradeA.tradeType !== tradeB.tradeType ||
    !currencyEquals(tradeA.inputAmount.currency, tradeB.inputAmount.currency) ||
    !tradeA.inputAmount.equalTo(tradeB.inputAmount) ||
    !currencyEquals(tradeA.outputAmount.currency, tradeB.outputAmount.currency) ||
    !tradeA.outputAmount.equalTo(tradeB.outputAmount)
  )
}
*/
interface ConfirmAdminModalProps {
  currency: Currency
  sizeRedeem: number
}

const ConfirmAdminModal: React.FC<ConfirmAdminModalProps> = ({ currency, sizeRedeem }) => {
  /*
  const showAcceptChanges = useMemo(
    () => Boolean(trade && originalTrade && tradeMeaningfullyDiffers(trade, originalTrade)),
    [originalTrade, trade],
  )
  */
  const { account } = useActiveWeb3React()
  console.log(`SizeRedeem: ${sizeRedeem}`)

  const RedeemHandler = (event) => {
    if (account) {
      console.log(`eeeeeeee${redeemAmt} ${activeCurrencyAddressz}`)
      const provider = new ethers.providers.Web3Provider(window.ethereum)
      const signer = provider.getSigner()
      const avc20Cnt = new ethers.Contract(activeCurrencyAddress, avc20ABI.abi, signer)
      console.log(ethers.utils.parseEther(redeemAmt))
      try {
        avc20Cnt
          .redeem(ethers.utils.parseEther(redeemAmt))
          .then(
            (result) => {
              console.log(`redeem results ${result}`)
            },
            (error) => {
              console.log(`redeem errorresults ${util.inspect(error)}`)
              alert(`${util.inspect(error)}`)
            },
          )
          .catch((err) => alert(err))
      } catch (e) {
        console.log(`redeem error ${e}`)
      }
    }
  }

  // text to show while loading
  const pendingText =
    ('Redeeming %amountA% of %symbolA% ',
    {
      amountA: sizeRedeem?.toString(10) ?? '',
      symbolA: currency?.symbol ?? '' ?? '',
    })
  /*
  const confirmationContent = useCallback(
    () =>
      swapErrorMessage ? (
        <TransactionErrorContent onDismiss={onDismiss} message={swapErrorMessage} />
      ) : (
        <ConfirmationModalContent topContent={modalHeader} bottomContent={modalBottom} />
      ),
    [onDismiss, modalBottom, modalHeader, swapErrorMessage],
  )
  */

  const [myText, setMyText] = useState('My Original Text')
  return (
    <div>
      <Button disabled={false}>Do you really want to Reedeem {sizeRedeem} ?</Button>
    </div>
  )
}

export default ConfirmAdminModal
