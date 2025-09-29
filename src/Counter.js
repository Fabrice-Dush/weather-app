import React from "react";

class Counter extends React.Component {
  constructor(props) {
    super(props);

    this.state = { count: 0 };
  }

  handleDescrement() {
    this.setState((curState) => ({ ...curState, count: curState.count - 1 }));
  }

  handleIncrement() {
    this.setState((curState) => ({ ...curState, count: curState.count + 1 }));
  }

  render() {
    const btnStyle = { cursor: "pointer" };
    const textStyle = {};

    const date = new Date(
      Date.now() + this.state.count * 24 * 60 * 60 * 1000
    ).toDateString();

    return (
      <>
        <div>
          <button style={btnStyle} onClick={this.handleDescrement.bind(this)}>
            -
          </button>
          <span>{this.state.count}</span>
          <button style={btnStyle} onClick={this.handleIncrement.bind(this)}>
            +
          </button>
        </div>
        <p style={textStyle}>
          {this.state.count < 0
            ? `${Math.abs(this.state.count)} days ago was `
            : this.state.count > 0
            ? `${this.state.count} days from now is `
            : `Today is `}
          {date}
        </p>
      </>
    );
  }
}

export default Counter;
