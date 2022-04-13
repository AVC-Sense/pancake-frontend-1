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

export default function ManagementCard() {
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

  const userHasSpecifiedInputOutput = Boolean(
    !!currencies[Field.INPUT] && parsedAmounts[Field.INPUT]?.greaterThan(JSBI.BigInt(0)),
  )

  const userHasEnoughToken = Boolean(
    currencies[Field.INPUT] && maxAmountInput && parsedAmounts[Field.INPUT]
      ? JSBI.lessThanOrEqual(parsedAmounts[Field.INPUT].raw, maxAmountInput.raw)
      : undefined,
  )

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
      })
    } else {
      setErrorMessage('Install MetaMask please')
    }
  }

  const accountChangedHandler = (newAccount) => {
    setDefaultAccount(newAccount)
  }

  const getAccountBalance = (account22) => {
    return ''
  }

  const handleInputSelect = (inputCurrency) => {
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

  const voteForHandler22 = async (event) => {
    if (account) {
      console.log(`voteForHandler zzz ${currencies[Field.INPUT].address}
        whichProposal: ${whichProposal}`)
      const provider = new ethers.providers.Web3Provider(window.ethereum)
      const signer = provider.getSigner()
      const avc20Cnt = new ethers.Contract(currencies[Field.INPUT].address, avc20ABI.abi, signer)
      try {
        console.log(`before get num proposals`)
        const numProposalStart = await avc20Cnt.getNumProposalsMint()
        console.log(`numProposalStart ${numProposalStart}`)
        const result = await avc20Cnt.placeVoteForDistMint(whichProposal)
        const numProposalEnd = await avc20Cnt.getNumProposalsMint()
        /*
        if (numProposalEnd > numProposalStart) {
          alert('Voting Succeeded, A distribution occurred')
        }
        */
        alert(`Voting succeeded`)
        setIsCloseA({ close: true })
      } catch (e) {
        alert(`voting failed`)
        console.log(`voting error ${util.inspect(e)}`)
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

  const getProposalInformtion = async () => {
    const MAX_PROPOSALS = 5
    console.log(`getProposalInformtion`)
    if (account) {
      const provider = new ethers.providers.Web3Provider(window.ethereum)
      const signer = provider.getSigner()
      const avc20Cnt = new ethers.Contract(currencies[Field.INPUT].address, avc20ABI.abi, signer)

      try {
        const numProposal = await avc20Cnt.getNumProposalsMint()
        if (numProposal === 0) return
        const viewProposals = []
        let temp
        let getLast
        let numVotes

        /* eslint no-await-in-loop: 0 */

        for (let i = Math.max(numProposal - MAX_PROPOSALS, 0); i < numProposal; ++i) {
          getLast = await avc20Cnt.getProposalMint(i)
          numVotes = await avc20Cnt.getMyVoteMint(i)
          temp = {
            'Votes For': (Number(getLast[0]) / 10 ** 18).toString(),
            'prop #': getLast[1].toString(),
            time: getLast[2].toString(),
            'Passed?': getLast[3].toString(),
            id: getLast[4].toString(),
            'My Vote': (Number(numVotes) / 10 ** 18).toString(),
            MintAmt: (Number(getLast[6]) / 10 ** 18).toString(),
          }
          setWhichProposal(getLast[1].toString())
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

  const mintHandler = async (event) => {
    if (account) {
      console.log(`enter mint ${formattedAmounts[Field.INPUT]}`)
      const provider = new ethers.providers.Web3Provider(window.ethereum)
      const signer = provider.getSigner()
      const avc20Cnt = new ethers.Contract(currencies[Field.INPUT].address, avc20ABI.abi, signer)
      try {
        const result = await avc20Cnt.mintToSelf(ethers.utils.parseEther(formattedAmounts[Field.INPUT]))

        alert(`Minting succeeded`)
        setMintClose({ close: true })
      } catch (e) {
        alert(`mint failed`)
        console.log(`mint error ${util.inspect(e)}`)
      }
    } else {
      console.log('no account')
    }
  }

  const [mintClose, setMintClose] = useState({ close: false })

  const [OnMint] = useModal(
    <GenericConfirmModal
      functionHandler={mintHandler}
      displayText={`Do you want to Mint ${formattedAmounts[Field.INPUT]} of ${currencies[Field.INPUT]?.symbol}?`}
      isClose={mintClose}
      buttonName="Mint"
    />,
    true,
    true,
    'onMint',
  )

  const transferHandler = async (event) => {
    if (account) {
      console.log(`enter transfer ${formattedAmounts[Field.INPUT]}`)
      const provider = new ethers.providers.Web3Provider(window.ethereum)
      const signer = provider.getSigner()
      console.log(`enter transfer 22`)
      const avc20Cnt = new ethers.Contract(activeCurrencyAddress, avc20ABI.abi, signer)
      try {
        console.log(`before transfer`)
        const result = await avc20Cnt.transferOwnership(newOwner)

        alert(`transfer succeeded`)
        setTransferClose({ close: true })
      } catch (e) {
        alert(`transfer failed`)
        console.log(`transfer error ${util.inspect(e)}`)
      }
    } else {
      console.log('no account')
    }
  }

  const [newOwner, setNewOwner] = useState('')
  const [transferClose, setTransferClose] = useState({ close: false })

  const [OnTransferOwnership] = useModal(
    <GenericConfirmModal
      functionHandler={transferHandler}
      displayText={`Do you want to Transfer Ownership ${util.inspect(
        currencies[Field.INPUT]?.symbol,
      )} of to ${newOwner} ?`}
      isClose={transferClose}
      buttonName="Transfer Ownership"
    />,
    true,
    true,
    'onTransferOwnership',
  )

  const burnHandler = async (event) => {
    if (account) {
      console.log(`enter mint ${formattedAmounts[Field.INPUT]}`)
      const provider = new ethers.providers.Web3Provider(window.ethereum)
      const signer = provider.getSigner()
      const avc20Cnt = new ethers.Contract(currencies[Field.INPUT].address, avc20ABI.abi, signer)
      try {
        const result = await avc20Cnt.burn(ethers.utils.parseEther(formattedAmounts[Field.INPUT]))

        alert(`Burn succeeded`)
        setBurnClose({ close: true })
      } catch (e) {
        alert(`burn failed`)
        console.log(`burn error ${util.inspect(e)}`)
      }
    } else {
      console.log('no account')
    }
  }

  const [burnClose, setBurnClose] = useState({ close: false })

  const [OnBurn] = useModal(
    <GenericConfirmModal
      functionHandler={burnHandler}
      displayText={`Do you want to Burn ${formattedAmounts[Field.INPUT]} of ${currencies[Field.INPUT]?.symbol}?`}
      isClose={burnClose}
      buttonName="Burn"
    />,
    true,
    true,
    'onBurn',
  )

  const radioHandler = (event) => {
    setWhichProposal(event.target.value)
    console.log(`called radioHandler ${util.inspect(event.target.value)}`)
    return null
  }

  const newProposalHandler = async (event) => {
    console.log('enter new proposalaa')
    if (account) {
      console.log('enter new proposalbb')
      const provider = new ethers.providers.Web3Provider(window.ethereum)
      const signer = provider.getSigner()
      const avc20Cnt = new ethers.Contract(currencies[Field.INPUT].address, avc20ABI.abi, signer)
      try {
        console.log(`YYYYY   ${proposalMintAmt}`)
        console.log(`XXXXXX ${ethers.utils.parseEther(proposalMintAmt)}`)
        const result = await avc20Cnt.addProposalMint(ethers.utils.parseEther(proposalMintAmt))
        alert('newProposalHandler Succeeded')
        console.log(`total supply ${await avc20Cnt.totalSupply()}`)
      } catch (e) {
        alert(`newProposalHandler Failed`)
        console.log(`newProposalHandler error ${util.inspect(e)}`)
      }
    } else {
      console.log('no account')
    }
    setIsCloseD({ close: false })
  }

  const [proposalMintAmt, setProposalMintAmt] = useState('1000')

  const [isCloseD, setIsCloseD] = useState({ close: false })

  const [OnNewProposal] = useModal(
    <GenericConfirmModal
      functionHandler={newProposalHandler}
      displayText={`Do you want to add a new proposal  for ${proposalMintAmt}?`}
      isClose={isCloseD}
      buttonName="Add New Proposal"
    />,
    true,
    true,
    'onNewProposal',
  )

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
  const [whichProposal, setWhichProposal] = useState('0')
  const [proposalData, setProposalData] = useState([{}])

  /* eslint react/jsx-boolean-value: 0 */

  return (
    <Page removePadding={false}>
      <Flex width="100%" justifyContent="center" position="relative">
        <div>
          <CurrencyInputHeader
            title="Token Management"
            subtitle="Manage Tokens"
            isChartDisplayed={false}
            hasAmount={false}
            onRefreshPrice={() => {
              console.log('refreshzz22')
            }}
          />
          <CurrencyInputPanelCustom2
            onCurrencySelect={handleInputSelect}
            label="yahoo22"
            currency={currencies[Field.INPUT]}
            value={formattedAmounts[Field.INPUT]}
            showMaxButton={true}
            onUserInput={handleTypeInput}
            id="swap-currency-input"
          />

          <Table>
            <tr>
              {account && currencies[Field.INPUT] ? (
                <Button
                  disabled={false}
                  onClick={() => {
                    OnBurn()
                  }}
                >
                  Burn
                </Button>
              ) : (
                <Button disabled>Burn</Button>
              )}
            </tr>
            <tr>
              <td>
                {account && currencies[Field.INPUT] ? (
                  <Button
                    disabled={false}
                    onClick={() => {
                      OnTransferOwnership()
                    }}
                  >
                    Transfer Ownership
                  </Button>
                ) : (
                  <Button disabled>Transfer Ownership</Button>
                )}
              </td>
              <td>
                <input
                  type="text"
                  id="lname"
                  name="lname"
                  placeholder="0x000.."
                  onChange={(event) => {
                    setNewOwner(event.target.value)
                  }}
                />
              </td>
            </tr>
            <tr>
              <td>
                {account && currencies[Field.INPUT] ? (
                  <Button
                    disabled={false}
                    onClick={() => {
                      getProposalInformtion()
                    }}
                  >
                    Refresh Mint Proposal Data
                  </Button>
                ) : (
                  <Button disabled>Refresh Proposal Data</Button>
                )}
              </td>
            </tr>

            <tr>
              {account && currencies[Field.INPUT] ? (
                <Button
                  disabled={false}
                  onClick={() => {
                    onPresentConfirmModal3()
                  }}
                >
                  Vote For Mint Proposal
                </Button>
              ) : (
                <Button disabled>Vote For Distribution</Button>
              )}
            </tr>
            <tr>
              <td>
                {account && currencies[Field.INPUT] ? (
                  <Button
                    disabled={false}
                    onClick={() => {
                      OnNewProposal()
                    }}
                  >
                    Add Mint Proposal
                  </Button>
                ) : (
                  <Button disabled>Add Proposal</Button>
                )}
              </td>
              <td>
                <input
                  type="text"
                  id="lname"
                  name="lname"
                  placeholder="1000"
                  onChange={(event) => {
                    setProposalMintAmt(Number(event.target.value))
                  }}
                />
              </td>
            </tr>
          </Table>
          <Table>
            <tr key="header">
              {Object.keys(proposalData[0]).map((key) => (
                <Th>{key}</Th>
              ))}
              {proposalData.length === 1 && Object.keys(proposalData[0]).length === 0 ? '' : <Th>Select Prop</Th>}
            </tr>
            {proposalData.map((item: any) => (
              <tr key={item.id}>
                {Object.values(item).map((val) => (
                  <Td>{val}</Td>
                ))}
                <Td>
                  {' '}
                  {proposalData.length === 1 && Object.keys(proposalData[0]).length === 0 ? (
                    ''
                  ) : (
                    <input
                      type="radio"
                      id={item.id}
                      name="fname"
                      value={item.id}
                      selected111={false}
                      onChange={radioHandler}
                    />
                  )}
                </Td>
              </tr>
            ))}
          </Table>

          {errorMessage}
        </div>
      </Flex>
    </Page>
  )
}
