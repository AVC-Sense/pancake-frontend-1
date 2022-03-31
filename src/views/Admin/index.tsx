import AdminNav from './components/AdminNav'

export const AdminPageLayout = ({ children }) => {
  return (
    <>
      <AdminNav />
      {children}
    </>
  )
}
