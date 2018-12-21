import React from "react";

import PleaseSignIn from "../components/PleaseSignIn";
import OrderComponent from "../components/Order";

const Order = props => (
  <div>
    <PleaseSignIn>
      <OrderComponent id={props.query.id}>Single order</OrderComponent>
    </PleaseSignIn>
  </div>
);

export default Order;
