import { Layout } from "antd";
import AppBar from "../components/AppBar";

const { Content, Header } = Layout;

export default function withGlobalHeader(children) {
  return (
    <Layout
      style={{
        backgroundColor: "transparent",
        minHeight: "100vh",
      }}
    >
      <AppBar />
      <Content>{children}</Content>
    </Layout>
  );
}
