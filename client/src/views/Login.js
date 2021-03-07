import { Link } from "react-router-dom";
import Forms from "../components/Forms";

export default function Login(props) {
  return (
    <Forms
      formType="login"
      url="/login"
      formTitle="Login"
      footer={
        <>
          No accounts yet ?{" "}
          <strong>
            <Link to="/signup">Register now !</Link>
          </strong>
        </>
      }
    />
  );
}
