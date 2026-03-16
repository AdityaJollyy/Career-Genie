import Header from "./Header";
import { checkUser } from "@/lib/checkUser";

export default async function HeaderServer() {
  await checkUser();
  return <Header />;
}
