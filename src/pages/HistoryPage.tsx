import { useSpace } from "@/hooks/useSpace";
import { Navigate } from "react-router-dom";
import History from "./History";

export default function HistoryPage() {
  const { spaceId } = useSpace();

  if (!spaceId) return <Navigate to="/" replace />;

  return <History spaceId={spaceId} />;
}
