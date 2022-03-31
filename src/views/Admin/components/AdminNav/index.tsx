import { Box, ButtonMenu, ButtonMenuItem, Flex } from '@pancakeswap/uikit'
import { NextLinkFromReactRouter } from 'components/NextLink'
import { useTranslation } from 'contexts/Localization'
import { useRouter } from 'next/router'
import styled from 'styled-components'

const NavWrapper = styled(Flex)`
  background: ${({ theme }) => theme.colors.gradients.cardHeader};
  justify-content: space-between;
  padding: 20px 16px;
  flex-direction: column;
  gap: 8px;
  ${({ theme }) => theme.mediaQueries.sm} {
    padding: 20px 40px;
    flex-direction: row;
  }
`

const AdminNav = () => {
  const { t } = useTranslation()
  const router = useRouter()
  const isPools = router.asPath === '/info/pools'
  const isTokens = router.asPath === '/info/tokens'
  let activeIndex = 0
  if (isPools) {
    activeIndex = 1
  }
  if (isTokens) {
    activeIndex = 2
  }
  return (
    <NavWrapper>
      <Box>
        <ButtonMenu activeIndex={activeIndex} scale="sm" variant="subtle">
          <ButtonMenuItem as={NextLinkFromReactRouter} to="/admin">
            {t('Redeem')}
          </ButtonMenuItem>
          <ButtonMenuItem as={NextLinkFromReactRouter} to="/info/pools">
            {t('Pools')}
          </ButtonMenuItem>
          <ButtonMenuItem as={NextLinkFromReactRouter} to="/info/tokens">
            {t('Tokens')}
          </ButtonMenuItem>
        </ButtonMenu>
      </Box>
      <Box width={['100%', '100%', '250px']} />
    </NavWrapper>
  )
}

export default AdminNav
