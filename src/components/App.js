import React, { Component } from "react";
import Web3 from "web3";
import "./App.css";
import MemoryToken from "../abis/MemoryToken.json";
import brain from "../brain.png";

const CARD_ARRAY = [
  {
    name: "fries",
    img: "/images/fries.png",
  },
  {
    name: "cheeseburger",
    img: "/images/cheeseburger.png",
  },
  {
    name: "ice-cream",
    img: "/images/ice-cream.png",
  },
  {
    name: "pizza",
    img: "/images/pizza.png",
  },
  {
    name: "milkshake",
    img: "/images/milkshake.png",
  },
  {
    name: "hotdog",
    img: "/images/hotdog.png",
  },
  {
    name: "fries",
    img: "/images/fries.png",
  },
  {
    name: "cheeseburger",
    img: "/images/cheeseburger.png",
  },
  {
    name: "ice-cream",
    img: "/images/ice-cream.png",
  },
  {
    name: "pizza",
    img: "/images/pizza.png",
  },
  {
    name: "milkshake",
    img: "/images/milkshake.png",
  },
  {
    name: "hotdog",
    img: "/images/hotdog.png",
  },
];

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      account: "0x0",
      token: null,
      totalSupply: 0,
      allTokenURIs: [],
      tokenURIs: [],
      cardArray: [],
      cardsChosen: [],
      cardsChosenId: [],
      cardsWon: [],
    };
  }

  async componentWillMount() {
    await this.loadWeb3();
    await this.loadBlockchainData();
    this.setState({ cardArray: CARD_ARRAY.sort(() => 0.5 - Math.random()) });
  }

  async loadWeb3() {
    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum);
      await window.ethereum.enable();
    } else if (window.web3) {
      window.web3 = new Web3(window.web3.currentProvider);
    } else {
      window.alert(
        "Non-Ethereum browser detected. You should consider trying MetaMask!"
      );
    }
  }

  async loadBlockchainData() {
    const web3 = window.web3;
    const accounts = await web3.eth.getAccounts();
    this.setState({ account: accounts[0] });

    // Load smart contract
    const networkId = await web3.eth.net.getId();
    const networkData = MemoryToken.networks[networkId];
    if (networkData) {
      const abi = MemoryToken.abi;
      const address = networkData.address;
      const token = new web3.eth.Contract(abi, address);
      this.setState({ token });
      const totalSupply = await token.methods.totalSupply().call();
      this.setState({ totalSupply });
      // Load Tokens
      let balanceOf = await token.methods.balanceOf(accounts[0]).call();
      for (let i = 0; i < totalSupply; i++) {
        if (i < balanceOf) {
          let id = await token.methods
            .tokenOfOwnerByIndex(accounts[0], i)
            .call();
          let tokenURI = await token.methods.tokenURI(id).call();
          // Token URIs collected by Owner(You)
          this.setState({
            tokenURIs: [...this.state.tokenURIs, tokenURI],
          });
        }
        let tokenId = i + 1;
        let tokenURI = await token.methods.tokenURI(tokenId.toString()).call();
        // Token URIs(collected by all users) existed in token contract
        this.setState({
          allTokenURIs: [...this.state.allTokenURIs, tokenURI],
        });
      }
    } else {
      alert("Smart contract not deployed to detected network.");
    }
  }

  chooseImage = (cardId) => {
    cardId = cardId.toString();
    if (this.state.cardsWon.includes(cardId)) {
      return window.location.origin + "/images/white.png";
    } else if (this.state.cardsChosenId.includes(cardId)) {
      return CARD_ARRAY[cardId].img;
    } else {
      return window.location.origin + "/images/blank.png";
    }
  };

  flipCard = async (cardId) => {
    let alreadyChosen = this.state.cardsChosen.length;

    this.setState({
      cardsChosen: [
        ...this.state.cardsChosen,
        this.state.cardArray[cardId].name,
      ],
      cardsChosenId: [...this.state.cardsChosenId, cardId],
    });

    if (alreadyChosen === 1) {
      setTimeout(this.checkForMatch, 100);
    }
  };

  mint = async (optionOneId, optionTwoId) => {
    let result = this.state.allTokenURIs.filter(
      (tokenURI) =>
        tokenURI ===
        window.location.origin + CARD_ARRAY[optionOneId].img.toString()
    );
    if (result.length === 0) {
      alert("You found a match");
      this.state.token.methods
        .mint(
          this.state.account,
          window.location.origin + CARD_ARRAY[optionOneId].img.toString()
        )
        .send({ from: this.state.account })
        .on("transactionHash", (hash) => {
          this.setState({
            cardsWon: [...this.state.cardsWon, optionOneId, optionTwoId],
            tokenURIs: [...this.state.tokenURIs, CARD_ARRAY[optionOneId].img],
            allTokenURIs: [
              ...this.state.allTokenURIs,
              CARD_ARRAY[optionOneId].img,
            ],
          });
        });
    } else {
      let result = this.state.tokenURIs.filter(
        (tokenURI) =>
          tokenURI ===
          window.location.origin + CARD_ARRAY[optionOneId].img.toString()
      );
      alert(
        `${
          result.length === 0
            ? "This has been collected by other"
            : "You have already collected this"
        }`
      );
    }
  };

  checkForMatch = async () => {
    const optionOneId = this.state.cardsChosenId[0];
    const optionTwoId = this.state.cardsChosenId[1];

    if (optionOneId === optionTwoId) {
      alert("You have clicked the same image!");
    } else if (this.state.cardsChosen[0] === this.state.cardsChosen[1]) {
      this.mint(optionOneId, optionTwoId);
    } else {
      alert("Sorry, try again");
    }
    this.setState({
      cardsChosen: [],
      cardsChosenId: [],
    });
    if (
      this.state.cardsWon.length + this.state.tokenURIs.length ===
      CARD_ARRAY.length
    ) {
      alert("Congratulations! You found them all!");
    }
  };

  render() {
    return (
      <div>
        <nav className="navbar navbar-dark fixed-top bg-dark flex-md-nowrap p-0 shadow">
          <a
            className="navbar-brand col-sm-3 col-md-2 mr-0"
            href="https://github.com/CryptoDevelopmentServices/blockchain-nft-memory-game"
            target="_blank"
            rel="noopener noreferrer"
          >
            <img
              src={brain}
              width="30"
              height="30"
              className="d-inline-block align-top"
              alt=""
            />
            &nbsp; CDS Memory Tokens
          </a>
          <ul className="navbar-nav px-3">
            <li className="nav-item text-nowrap d-none d-sm-none d-sm-block">
              <small className="text-muted">
                <span id="account">{this.state.account}</span>
              </small>
            </li>
          </ul>
        </nav>
        <div className="container-fluid mt-5">
          <div className="row">
            <main role="main" className="col-lg-12 d-flex text-center">
              <div className="content mr-auto ml-auto">
                <h1 className="d-4">Start matching now!</h1>
                <div className="grid mb-4">
                  {this.state.cardArray.map((card, key) => {
                    return (
                      <img
                        key={key}
                        src={this.chooseImage(key)}
                        data-id={key}
                        onClick={(event) => {
                          let cardId = event.target.getAttribute("data-id");
                          if (
                            !this.state.cardsWon.includes(cardId.toString())
                          ) {
                            this.flipCard(cardId);
                          }
                        }}
                        alt="cardImage"
                      />
                    );
                  })}
                </div>
                <div>
                  <h5>
                    Tokens Collected By You:
                    <span id="result">&nbsp;{this.state.tokenURIs.length}</span>
                  </h5>
                  <div className="grid mb-4">
                    {this.state.tokenURIs.map((tokenURI, key) => {
                      return <img key={key} src={tokenURI} alt="img" />;
                    })}
                  </div>
                </div>
                <div>
                  <h5>
                    Total Supply:
                    <span id="result">
                      &nbsp;{this.state.allTokenURIs.length}
                    </span>
                  </h5>
                  <div className="grid mb-4">
                    {this.state.allTokenURIs.map((tokenURI, key) => {
                      return <img key={key} src={tokenURI} alt="img" />;
                    })}
                  </div>
                </div>
              </div>
            </main>
          </div>
        </div>
      </div>
    );
  }
}

export default App;
