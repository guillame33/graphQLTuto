import React from "react";
import styled from "styled-components";

import SignupComponent from "../components/Signup";
import SigninComponent from "../components/Signin";
import RequestReset from "../components/RequestReset";

const Columns = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  grid-gap: 20px;
`;

const Signup = props => (
  <Columns>
    <SignupComponent />
    <SigninComponent />
    <RequestReset />
  </Columns>
);

export default Signup;
