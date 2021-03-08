import { Layout } from "antd";
import AppBar from "./AppBar";

const { Content } = Layout;

export default function GlobalHeader({ component: Component, ...restProps }) {
  return (
    <Layout
      style={{
        backgroundColor: "transparent",
        minHeight: "100vh",
      }}
    >
      <AppBar {...restProps} />
      <Content>
        <Component {...restProps} />
      </Content>
    </Layout>
  );
}
