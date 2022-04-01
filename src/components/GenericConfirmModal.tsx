import util from 'util'
import avc20ABI from 'config/abi/AVC20.json'
import { useCallback, useMemo, useState } from 'react'
import { currencyEquals, Trade, Currency } from '@pancakeswap/sdk'
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

interface GenericConfirmModalProps {
  customOnDismiss?: () => void
  functionHandler?: (event: any) => Promise<void>
  displayText: string
  isClose: any
  buttonName: string
}

const GenericConfirmModal: React.FC<InjectedModalProps & GenericConfirmModalProps> = ({
  customOnDismiss,
  onDismiss,
  functionHandler,
  displayText,
  isClose,
  buttonName,
}) => {
  const handleDismiss = (event) => {
    console.log('called handleDismiss')
    console.log(functionHandler)
  }

  const pendingText = 'rrrrr'

  return (
    <Modal title={`${displayText} `} headerBackground="gradients.cardHeader" onDismiss={onDismiss}>
      <div>
        {!isClose.close ? (
          <Button disabled={false} onClick={functionHandler}>
            {buttonName}
          </Button>
        ) : (
          ' '
        )}

        {isClose.close ? <Button onClick={onDismiss}>Close </Button> : ' '}
      </div>
    </Modal>
  )
}

export default GenericConfirmModal
