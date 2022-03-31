import util from 'util'
import React, { useState, useCallback } from 'react'
import avc20ABI from 'config/abi/AVC20.json'
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
} from '@pancakeswap/uikit'
import { CurrencyAmount, JSBI, Token, Trade } from '@pancakeswap/sdk'
import { ethers } from 'ethers'
import { Field } from '../../../state/swap/actions'
import ConnectWalletButton from '../../../components/ConnectWalletButton'
import useActiveWeb3React from '../../../hooks/useActiveWeb3React'
import CurrencyInputPanelCustom2 from '../../../components/CurrencyInputPanelCustom2'
import Page from '../../Page'
import { maxAmountSpend } from '../../../utils/maxAmountSpend'
import CurrencyInputHeader from '../../Swap/components/CurrencyInputHeader'
import ConfirmAdminModal from '../components/ConfirmAdminModel'

import {
  useDefaultsFromURLSearch,
  useDerivedSwapInfo,
  useSwapActionHandlers,
  useSwapState,
  useSingleTokenSwapInfo,
} from '../../../state/swap/hooks'

declare let window: any

const AdminRedeemCard = (lastAddress: string) => {
  console.log(`last Adresss ${util.inspect(lastAddress)}`)
  const { account } = useActiveWeb3React()
  const { v2Trade, currencyBalances, parsedAmount, currencies, inputError: swapInputError } = useDerivedSwapInfo()
  const { onSwitchTokens, onCurrencySelection, onUserInput, onChangeRecipient } = useSwapActionHandlers()

  const input2 = 0

  const maxAmountInput: CurrencyAmount | undefined = maxAmountSpend(currencyBalances[Field.INPUT])

  if (maxAmountInput) {
    console.log(`maxAmountSpend ${util.inspect(maxAmountInput)}`)
  }

  const handleTypeInput = useCallback(
    (value: string) => {
      onUserInput(Field.INPUT, value)
      setRedeemAmt(value)
      input2 = value
    },
    [onUserInput],
  )

  const { independentField, typedValue, recipient } = useSwapState()
  const dependentField: Field = independentField === Field.INPUT ? Field.OUTPUT : Field.INPUT

  const showWrap = true

  const parsedAmounts = showWrap
    ? {
        [Field.INPUT]: parsedAmount,
        [Field.OUTPUT]: parsedAmount,
      }
    : {
        [Field.INPUT]: independentField === Field.INPUT ? parsedAmount : trade?.inputAmount,
        [Field.OUTPUT]: independentField === Field.OUTPUT ? parsedAmount : trade?.outputAmount,
      }

  if (parsedAmounts[Field.INPUT] && maxAmountInput) {
    console.log(`field inputww  : ${parsedAmounts[Field.INPUT].toSignificant(6)}`)
    console.log('tttttt')
    console.log(`nnnnn:  + ${JSBI.BigInt(maxAmountInput.numerator, maxAmountInput.denominator).toString(10)}`)
  }

  const userHasSpecifiedInputOutput = Boolean(
    !!currencies[Field.INPUT] && parsedAmounts[Field.INPUT]?.greaterThan(JSBI.BigInt(0)),
  )

  const userHasEnoughToken = Boolean(
    currencies[Field.INPUT] && maxAmountInput && parsedAmounts[Field.INPUT]
      ? JSBI.lessThanOrEqual(
          JSBI.BigInt(parsedAmounts[Field.INPUT].numerator, parsedAmounts[Field.INPUT].denominator),
          JSBI.BigInt(maxAmountInput.numerator, maxAmountInput.denominator),
        )
      : undefined,
  )

  console.log(`has enough token: ${userHasEnoughToken}`)

  const formattedAmounts = {
    [independentField]: typedValue,
    [dependentField]: showWrap
      ? parsedAmounts[independentField]?.toExact() ?? ''
      : parsedAmounts[dependentField]?.toSignificant(6) ?? '',
  }

  console.log(`currency: ${CurrencyInputPanelCustom2.currency}`)
  const connectWalletHandler = () => {
    if (window.ethereum) {
      window.ethereum.request({ method: 'eth_requestAccounts' }).then((result) => {
        accountChangedHandler(result[0])
        setConnButtonText('Wallet Connected')
        getAccountBalance(result[0])
      })
    } else {
      setErrorMessage('Install MetaMask please')
    }
  }

  const accountChangedHandler = (newAccount) => {
    setDefaultAccount(newAccount)
    getAccountBalance(newAccount.toString())
  }

  const getAccountBalance = (account22) => {
    return ''
  }

  const handleInputSelect = (inputCurrency) => {
    console.log(inputCurrency.address)
    setactiveCurrencyAddress(inputCurrency.address)
    onCurrencySelection(Field.INPUT, inputCurrency)
    /*
      setApprovalSubmitted(false) // reset 2 step UI for approvals
      onCurrencySelection(Field.INPUT, inputCurrency)
      const showSwapWarning = shouldShowSwapWarning(inputCurrency)
      if (showSwapWarning) {
        setSwapWarningCurrency(inputCurrency)
      } else {
        setSwapWarningCurrency(null)
      }
      */
  }

  const chainChangedHandler = () => {
    // reload the page to avoid any errors with chain change mid use of application
    window.location.reload()
  }

  const handleChangeInput = (event) => {
    setRedeemAmt(event.target.value)
  }

  const handleNewOwnerAddressInput = (event) => {
    setNewOwnerAddress(event.target.value)
  }

  const [onPresentConfirmModal] = useModal(
    <ConfirmAdminModal currency={currencies[Field.INPUT]} redeemAmt={formattedAmounts[Field.INPUT]} />,
    true,
    true,
    'confirmAdminModal',
  )

  const RedeemHandler = (event) => {
    if (account) {
      console.log(`eeeeeeee${redeemAmt} ${activeCurrencyAddress}`)
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

  const AddTokenHandler = (event) => {
    if (account) {
      const provider = new ethers.providers.Web3Provider(window.ethereum)
      const signer = provider.getSigner()
      const avc20Cnt = new ethers.Contract(activeCurrencyAddress, avc20ABI.abi, signer)

      try {
        avc20Cnt
          .addToTokensListArray(JSON.parse(newTokenAddress))
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

  const handleNewTokenInput = (event) => {
    setNewTokenAddress(event.target.value)
  }

  /*
  const distributeHandler = (event) => {
    if (account) {
      const provider = new ethers.providers.Web3Provider(window.ethereum)
      const signer = provider.getSigner()
      const avc20Cnt = new ethers.Contract(activeCurrencyAddress, avc20ABI.abi, signer)
      try {
        avc20Cnt
          .distribute()
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
  */
  const collectDistributionHandler = (event) => {
    if (account) {
      const provider = new ethers.providers.Web3Provider(window.ethereum)
      const signer = provider.getSigner()
      const avc20Cnt = new ethers.Contract(activeCurrencyAddress, avc20ABI.abi, signer)
      try {
        avc20Cnt
          .collect()
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

  const transferOwnershipHandler = (event) => {
    if (account) {
      const provider = new ethers.providers.Web3Provider(window.ethereum)
      const signer = provider.getSigner()
      const avc20Cnt = new ethers.Contract(activeCurrencyAddress, avc20ABI.abi, signer)
      try {
        avc20Cnt
          .transferOwnership(newOwnerAddress)
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

  const voteForHandler = (event) => {
    if (account) {
      const provider = new ethers.providers.Web3Provider(window.ethereum)
      const signer = provider.getSigner()
      const avc20Cnt = new ethers.Contract(activeCurrencyAddress, avc20ABI.abi, signer)
      try {
        avc20Cnt
          .placeVoteForDist()
          .then(
            (result) => {
              console.log(`vote for results ${result}`)
            },
            (error) => {
              console.log(`vote for errorresults ${util.inspect(error)}`)
              alert(`${util.inspect(error)}`)
            },
          )
          .catch((err) => alert(err))
      } catch (e) {
        console.log(`redeem error ${e}`)
      }
    }
  }

  const removeVoteHandler = (event) => {
    if (account) {
      const provider = new ethers.providers.Web3Provider(window.ethereum)
      const signer = provider.getSigner()
      const avc20Cnt = new ethers.Contract(activeCurrencyAddress, avc20ABI.abi, signer)
      try {
        avc20Cnt
          .removeVoteForDist()
          .then(
            (result) => {
              console.log(`remove vote results ${result}`)
            },
            (error) => {
              console.log(`remove vote ${util.inspect(error)}`)
              alert(`${util.inspect(error)}`)
            },
          )
          .catch((err) => alert(err))
      } catch (e) {
        console.log(`redeem error ${e}`)
      }
    }
  }

  const handleOnUserInput = (event) => {
    console.log(util.inspect(event))
    /*
      const handleTypeInput = useCallback(
      (value: string) => {
        onUserInput(Field.INPUT, value)
      },
      [onUserInput],
    )
    */
  }

  /*
 <div className='accountDisplay'>
				<h3>Address: {defaultAccount}</h3>
			</div>
			<div className='balanceDisplay'>
				<h3>Native Token Balance: {userBalance}</h3>
			</div>
			<div className='ALESSIO Balance'>
				<h3>ALLESSIO BALANCE: {balance1}</h3>
			</div>
	*/

  window.ethereum.on('accountsChanged', accountChangedHandler)

  window.ethereum.on('chainChanged', chainChangedHandler)

  const [errorMessage, setErrorMessage] = useState(null)
  const [defaultAccount, setDefaultAccount] = useState(null)
  const [userBalance, setUserBalance] = useState(null)
  const [connButtonText, setConnButtonText] = useState('Connect Wallet')
  const [balance1, setBalance1] = useState(null)
  const [redeemAmt, setRedeemAmt] = useState(null)
  const [activeCurrencyAddress, setactiveCurrencyAddress] = useState(null)
  const [newTokenAddress, setNewTokenAddress] = useState(null)
  const [newOwnerAddress, setNewOwnerAddress] = useState('0x0000000000000000000000000000000000000000')

  return (
    <Page removePadding={false}>
      <Flex width="100%" justifyContent="center" position="relative">
        <div>
          <CurrencyInputHeader
            title="Redeem"
            subtitle={"Redeem Token for Token's Assets"}
            setIsChartDisplayed={false}
            isChartDisplayed={false}
            hasAmount={false}
            onRefreshPrice={false}
          />
          <CurrencyInputPanelCustom2
            onCurrencySelect={handleInputSelect}
            label="yahoo"
            currency={currencies[Field.INPUT]}
            value={formattedAmounts[Field.INPUT]}
            showMaxButton={false}
            onUserInput={handleTypeInput}
            id="swap-currency-input"
          />
          <table>
            <tr>
              <td>
                {account && currencies[Field.INPUT] && maxAmountInput ? (
                  userHasSpecifiedInputOutput ? (
                    userHasEnoughToken ? (
                      <Button disabled={false} onClick={onPresentConfirmModal}>
                        Redeem
                      </Button>
                    ) : (
                      <Button disabled onClick={RedeemHandler}>
                        Insufficient Token Balace for Redeem
                      </Button>
                    )
                  ) : (
                    <Button disabled onClick={RedeemHandler}>
                      Enter Token Amount for Redemption
                    </Button>
                  )
                ) : (
                  <Button disabled onClick={RedeemHandler}>
                    Token Redeem
                  </Button>
                )}
              </td>
            </tr>
          </table>

          {errorMessage}
        </div>
      </Flex>
    </Page>
  )
}

export default AdminRedeemCard
