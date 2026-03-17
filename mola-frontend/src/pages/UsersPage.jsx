import MainLayout from "../layout/MainLayout";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext.jsx";

function UsersPage() {
  const { auth } = useContext(AuthContext);

  return (
    <MainLayout role={auth.role}>
      <h1 className="text-3xl font-bold">Users Management</h1>
    </MainLayout>
  );
}

export default UsersPage;