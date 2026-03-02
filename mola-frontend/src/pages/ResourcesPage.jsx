import MainLayout from "../layout/MainLayout";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

function ResourcesPage() {
  const { auth } = useContext(AuthContext);

  return (
    <MainLayout role={auth.role}>
      <h1 className="text-3xl font-bold">Resources Page</h1>
    </MainLayout>
  );
}

export default ResourcesPage;