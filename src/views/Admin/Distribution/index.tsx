import util from 'util'
import React, { useState, useCallback } from 'react'
import avc20ABI from 'config/abi/AVC20.json'
import {
  Table,
  Td,
  Th,
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
import GenericConfirmModal from '../../../components/GenericConfirmModal'

import {
  useDefaultsFromURLSearch,
  useDerivedSwapInfo,
  useSwapActionHandlers,
  useSwapState,
  useSingleTokenSwapInfo,
} from '../../../state/swap/hooks'

declare let window: any

export default function DistributionCard() {
  const { account } = useActiveWeb3React()
  const { v2Trade, currencyBalances, parsedAmount, currencies, inputError: swapInputError } = useDerivedSwapInfo()
  const { onSwitchTokens, onCurrencySelection, onUserInput, onChangeRecipient } = useSwapActionHandlers()

  const maxAmountInput: CurrencyAmount | undefined = maxAmountSpend(currencyBalances[Field.INPUT])

  const handleTypeInput = useCallback(
    (value: string) => {
      onUserInput(Field.INPUT, value)
      setRedeemAmt(value)
    },
    [onUserInput],
  )

  const handleConfirmDismiss = useCallback(() => {
    console.log('do nothing')
  }, [])

  const { independentField, typedValue, recipient } = useSwapState()
  const dependentField: Field = independentField === Field.INPUT ? Field.OUTPUT : Field.INPUT

  const showWrap = true

  const parsedAmounts = showWrap
    ? {
        [Field.INPUT]: parsedAmount,
        [Field.OUTPUT]: parsedAmount,
      }
    : {
        [Field.INPUT]: parsedAmount,
        [Field.OUTPUT]: parsedAmount,
        /*
        [Field.INPUT]: independentField === Field.INPUT ? parsedAmount : trade?.inputAmount,
        [Field.OUTPUT]: independentField === Field.OUTPUT ? parsedAmount : trade?.outputAmount,
        */
      }

  if (parsedAmounts[Field.INPUT] && maxAmountInput) {
    console.log(`field inputww1  : ${parsedAmounts[Field.INPUT].toSignificant(6)}`)
  }

  const userHasSpecifiedInputOutput = Boolean(
    !!currencies[Field.INPUT] && parsedAmounts[Field.INPUT]?.greaterThan(JSBI.BigInt(0)),
  )

  const userHasEnoughToken = Boolean(
    currencies[Field.INPUT] && maxAmountInput && parsedAmounts[Field.INPUT]
      ? JSBI.lessThanOrEqual(parsedAmounts[Field.INPUT].raw, maxAmountInput.raw)
      : undefined,
  )

  console.log(`has enough token: ${userHasEnoughToken}`)

  const formattedAmounts = {
    [independentField]: typedValue,
    [dependentField]: showWrap
      ? parsedAmounts[independentField]?.toExact() ?? ''
      : parsedAmounts[dependentField]?.toSignificant(6) ?? '',
  }

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
    getProposalInformtion()
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

  const handleNewOwnerAddressInputzzz = (event) => {
    console.log('hehehehe')
  }

  const voteForHandler22 = async (event) => {
    console.log('enter voteForHandler')
    if (account) {
      console.log('enter voteForHandler')
      const provider = new ethers.providers.Web3Provider(window.ethereum)
      const signer = provider.getSigner()
      const avc20Cnt = new ethers.Contract(activeCurrencyAddress, avc20ABI.abi, signer)
      try {
        const numProposalStart = await avc20Cnt.getNumProposals()
        console.log(`numProposalStart ${numProposalStart}`)
        const result = await avc20Cnt.placeVoteForDist(numProposalStart - 1)
        const numProposalEnd = await avc20Cnt.getNumProposals()
        if (numProposalEnd > numProposalStart) {
          alert('Voting Succeeded, A distribution occurred')
        }
        alert(`Voting succeeded`)
        setIsCloseA({ close: true })
      } catch (e) {
        alert(`voting failed`)
        console.log(`voting error ${util.inspect}`)
      }
    } else {
      console.log('no account')
    }
  }

  const [isCloseA, setIsCloseA] = useState({ close: false })

  const [onPresentConfirmModal3] = useModal(
    <GenericConfirmModal
      functionHandler={voteForHandler22}
      displayText="Do you wish to vote for Distribution?"
      isClose={isCloseA}
      buttonName="Distribute"
    />,
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

  const getProposalInformtion = async () => {
    const MAX_PROPOSALS = 2
    console.log(`getProposalInformtion`)
    if (account) {
      console.log(`eeeeeeee${redeemAmt} ${activeCurrencyAddress}`)
      const provider = new ethers.providers.Web3Provider(window.ethereum)
      const signer = provider.getSigner()
      const avc20Cnt = new ethers.Contract(activeCurrencyAddress, avc20ABI.abi, signer)

      try {
        const numProposal = await avc20Cnt.getNumProposals()
        if (numProposal === 0) return
        const viewProposals = []
        let temp
        let getLast
        let numVotes

        /* eslint no-await-in-loop: 0 */

        for (let i = Math.max(numProposal - 2, 0); i < numProposal; ++i) {
          getLast = await avc20Cnt.getProposal(i)
          numVotes = await avc20Cnt.getMyVote(i)
          temp = {
            'Votes For': getLast[0].toString(),
            'prop #': getLast[1].toString(),
            time: getLast[2].toString(),
            'Passed?': getLast[3].toString(),
            id: getLast[4].toString(),
            'My Vote': numVotes.toString(),
          }
          viewProposals.push(temp)
        }
        setProposalData(viewProposals)
        console.log(util.inspect(viewProposals))
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

  const voteForHandler = async (event) => {
    console.log('enter voteForHandler')
    if (account) {
      console.log('enter voteForHandler')
      const provider = new ethers.providers.Web3Provider(window.ethereum)
      const signer = provider.getSigner()
      const avc20Cnt = new ethers.Contract(activeCurrencyAddress, avc20ABI.abi, signer)
      try {
        const numProposalStart = await avc20Cnt.getNumProposals()
        const result = await avc20Cnt.placeVoteForDist(numProposalStart)
      } catch (e) {
        console.log(`voting error ${e}`)
      }
    } else {
      console.log('no account')
    }
  }

  const removeVoteHandler = async (event) => {
    console.log('enter voteForHandler')
    if (account) {
      console.log('enter voteForHandler')
      const provider = new ethers.providers.Web3Provider(window.ethereum)
      const signer = provider.getSigner()
      const avc20Cnt = new ethers.Contract(activeCurrencyAddress, avc20ABI.abi, signer)
      try {
        const numProposalStart = await avc20Cnt.getNumProposals()
        const result = await avc20Cnt.removeVoteForDist(numProposalStart - 1)
        alert('Remove Vote Succeeded')
      } catch (e) {
        alert(`Remove Vote Failed`)
        console.log(`voting error ${util.inspect}`)
      }
    } else {
      console.log('no account')
    }
    setIsCloseB({ close: true })
  }

  const [isCloseB, setIsCloseB] = useState({ close: false })

  const [onPresentConfirmRemove] = useModal(
    <GenericConfirmModal
      functionHandler={removeVoteHandler}
      displayText="Do you wish to Remove your votes?"
      isClose={isCloseB}
      buttonName="Remove Vote"
    />,
    true,
    true,
    'onPresentConfirmRemove',
  )

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
  const [data1, setdata1] = useState({ amount: 0 })
  const [proposalData, setProposalData] = useState([{}])

  return (
    <Page removePadding={false}>
      <Flex width="100%" justifyContent="center" position="relative">
        <div>
          <CurrencyInputHeader
            title="Distribution"
            subtitle="Distribute Token"
            isChartDisplayed={false}
            hasAmount={false}
            onRefreshPrice={() => {
              console.log('refreshzz22')
            }}
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
                {account && currencies[Field.INPUT] ? (
                  <Button
                    disabled={false}
                    onClick={() => {
                      getProposalInformtion()
                    }}
                  >
                    Refresh Proposal Data
                  </Button>
                ) : (
                  <Button disabled onClick={RedeemHandler}>
                    Refresh Proposal Data
                  </Button>
                )}
              </td>
            </tr>
          </table>
          <Table>
            <tr key="header">
              {Object.keys(proposalData[0]).map((key) => (
                <Th>{key}</Th>
              ))}
            </tr>
            {proposalData.map((item: any) => (
              <tr key={item.id}>
                {Object.values(item).map((val) => (
                  <Td>{val}</Td>
                ))}
              </tr>
            ))}
          </Table>

          <Table>
            <tr>
              {account && currencies[Field.INPUT] ? (
                <Button
                  disabled={false}
                  onClick={() => {
                    onPresentConfirmModal3()
                  }}
                >
                  Vote For Distribution
                </Button>
              ) : (
                <Button disabled onClick={RedeemHandler}>
                  Vote For Distribution
                </Button>
              )}
            </tr>

            <tr>
              {account && currencies[Field.INPUT] ? (
                <Button
                  disabled={false}
                  onClick={() => {
                    setIsCloseB({ close: false })
                    onPresentConfirmRemove()
                  }}
                >
                  Remove Vote For Distribution
                </Button>
              ) : (
                <Button disabled>Remove Vote For Distribution</Button>
              )}
            </tr>
          </Table>

          {errorMessage}
        </div>
      </Flex>
    </Page>
  )
}
