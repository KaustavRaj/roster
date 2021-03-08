import { Link } from "react-router-dom";
import Forms from "../components/Forms";

export default function Signup(props) {
  return (
    <Forms
      formType="signup"
      url="/api/signup"
      formTitle="Signup"
      footer={
        <>
          Already have an account ?{" "}
          <strong>
            <Link to="/login">Login here</Link>
          </strong>
        </>
      }
    />
  );
}
