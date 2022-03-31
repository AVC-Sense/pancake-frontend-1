import util from 'util'
import avc20ABI from 'config/abi/AVC20.json'
import { useCallback, useMemo, useState } from 'react'
import { currencyEquals, Trade } from '@pancakeswap/sdk'
import { ethers } from 'ethers'

import {
  Button,
  Text,
  ArrowDownIcon,
  Box,
  useModal,
  Modal,
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
  customOnDismiss?: () => void
}

const ConfirmAdminModal: React.FC<InjectedModalProps & ConfirmAdminModalProps> = ({
  currency,
  sizeRedeem,
  customOnDismiss,
  onDismiss,
}) => {
  /*
  const showAcceptChanges = useMemo(
    () => Boolean(trade && originalTrade && tradeMeaningfullyDiffers(trade, originalTrade)),
    [originalTrade, trade],
  )
  */
  const { account } = useActiveWeb3React()

  const RedeemHandler = (event) => {
    if (account) {
      setIsDisabled(true)
      console.log(`currency wwww: ${util.inspect(currency)}`)
      console.log(account)
      const provider = new ethers.providers.Web3Provider(window.ethereum)
      const signer = provider.getSigner()
      const avc20Cnt = new ethers.Contract(currency.address, avc20ABI.abi, signer)
      console.log(ethers.utils.parseEther(sizeRedeem))
      try {
        avc20Cnt
          .redeem(ethers.utils.parseEther(sizeRedeem))
          .then(
            (result) => {
              alert('transaction succeeded')
              console.log(`redeem results ${util.inspect(result)}`)
              setIsCloseButton(true)
            },
            (error) => {
              alert('transaction failed')
              console.log(`redeem errorresults ${util.inspect(error)}`)
              alert(`${util.inspect(error)}`)
              setIsCloseButton(true)
            },
          )
          .catch((err) => {
            alert(`transaction failed ${err}`)
            setIsCloseButton(true)
          })
      } catch (e) {
        console.log(`redeem error ${e}`)
        setIsCloseButton(true)
      }
    }
  }

  const handleDismiss = (event) => {
    console.log('called handleDismiss')
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
  const [isDisabled, setIsDisabled] = useState(false)
  const [isCloseButton, setIsCloseButton] = useState(false)

  return (
    <Modal
      title={`Confirm: Do you want to redeem ${sizeRedeem} tokens of ${currency?.symbol}`}
      headerBackground="gradients.cardHeader"
      onDismiss={onDismiss}
    >
      <div>
        !isCloseButton ?{' '}
        <Button disabled={isDisabled} onClick={RedeemHandler}>
          {' '}
          Redeem{' '}
        </Button>{' '}
        : isCloseButton ? <Button onClick={onDismiss}>Close </Button> :
      </div>
    </Modal>
  )
}

export default ConfirmAdminModal
