import util from 'util'
import React, { useState } from 'react'
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
import { ethers } from 'ethers'
import { Field } from '../../state/swap/actions'
import ConnectWalletButton from '../../components/ConnectWalletButton'
import useActiveWeb3React from '../../hooks/useActiveWeb3React'
import CurrencyInputPanel from '../../components/CurrencyInputPanel'

import {
  useDefaultsFromURLSearch,
  useDerivedSwapInfo,
  useSwapActionHandlers,
  useSwapState,
  useSingleTokenSwapInfo,
} from '../../state/swap/hooks'

declare let window: any

const AdminCard = () => {
  const { account } = useActiveWeb3React()
  const { v2Trade, currencyBalances, parsedAmount, currencies, inputError: swapInputError } = useDerivedSwapInfo()
  const { onSwitchTokens, onCurrencySelection, onUserInput, onChangeRecipient } = useSwapActionHandlers()
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
    /*
		window.ethereum.request({method: 'eth_getBalance', params: [account, 'latest']})
		.then(balance => {
			setUserBalance(ethers.utils.formatEther(balance));
		})
		.catch(error => {
			setErrorMessage(error.message);
		});
		//const lpContract = useERC20("0xa95A807A9fB3a689755ed87CAf22bA900CdA21f9")
		const provider = new ethers.providers.Web3Provider(window.ethereum)
		const erc20Cnt = new ethers.Contract("0xa95A807A9fB3a689755ed87CAf22bA900CdA21f9", erc20ABI, provider) 
		erc20Cnt.balanceOf(account).then(balance => {
			setBalance1(ethers.utils.formatEther(balance))
		})
		*/
    /*
		 lpContract.balanceOf(account)
			.then(balance => {
				setBalance1(ethers.utils.formatEther(balance))
			}

		 )
		 */
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
          .addToTokensListArray(newTokenAddress)
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

  const handleOnUserInput = (event) => {
    const x = 1
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

  return (
    <Flex width="100%" justifyContent="center" position="relative">
      <div>
        <CurrencyInputPanel
          onCurrencySelect={handleInputSelect}
          label="yahoo"
          currency={currencies[Field.INPUT]}
          value="0"
          showMaxButton={false}
          onUserInput={handleOnUserInput}
          /*
                  title={t('Swap')}
                  subtitle={t('Trade tokens in an instant')}
                  setIsChartDisplayed={setIsChartDisplayed}
                  isChartDisplayed={isChartDisplayed}
                  hasAmount={hasAmount}
                  onRefreshPrice={onRefreshPrice}
            		*/
          id="swap-currency-input"
        />
        <table>
          <tr>
            <th>function</th>
            <th>data</th>
          </tr>
          <tr>
            <td>
              <Button disabled={!account} onClick={RedeemHandler}>
                Redeem{' '}
              </Button>
            </td>
            <td>
              {' '}
              <input type="text" name="rdmAmt" onChange={handleChangeInput} />
            </td>
          </tr>
          <tr>
            <td>
              <Button disabled={!account} onClick={AddTokenHandler}>
                Add New Calc Token{' '}
              </Button>
            </td>
            <td>
              {' '}
              <input type="text" name="rdmAmt" onChange={handleNewTokenInput} />
            </td>
          </tr>
          <tr>
            <td>
              <Button disabled={!account} onClick={distributeHandler}>
                Distribute Token{' '}
              </Button>
            </td>
          </tr>
          <tr>
            <td>
              <Button disabled={!account} onClick={collectDistributionHandler}>
                Collect Distribution{' '}
              </Button>
            </td>
          </tr>
        </table>

        {errorMessage}
      </div>
    </Flex>
  )
}

export default AdminCard
