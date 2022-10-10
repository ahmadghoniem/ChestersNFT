import {PublicKey} from '@solana/web3.js'
import React, { useState } from "react";
import "./style.scss";
import JsonObj from './data.json';
import axios from 'axios';


const App = () => {
// CONSTANTS
	const [tokenAddresses, settokenAddresses] = useState([""]);
	const [address, setAddress] = useState("");
// FUNCTIONS	
function calculateTPS(response) {
	var total = 0;
	response.result.map((result) => {
	total += result.numTransactions;
	});
	return Math.floor((total/30)/60);
}
  function UpdateSolStatus() {
var got = '';

const options = {
	method: 'POST',
	headers: {Accept: 'application/json', 'Content-Type': 'application/json'},
	body: JSON.stringify({id: 1, jsonrpc: '2.0', method: 'getRecentPerformanceSamples', params: [30]})
  };

fetch('https://solana-mainnet.g.alchemy.com/v2/demo', options)
.then(response => response.json())
.then(response => document.querySelector("[SolTPS]").innerHTML = calculateTPS(response))
.catch(err => console.error(err));

	var xmlHttp = new XMLHttpRequest();
	xmlHttp.open( "GET", "https://api.solscan.io/market?symbol=SOL", false ); // false for synchronous request
	xmlHttp.send( null );

    
    document.querySelector("[SolPrice]").innerHTML =JSON.parse(xmlHttp.responseText).data.priceUsdt;
	document.querySelector("[SolPriceChange]").innerHTML =" ("+JSON.parse(xmlHttp.responseText).data.priceChange24h.toFixed(2)+"%)";
	setTimeout(UpdateSolStatus, 1200000);
}

UpdateSolStatus();

    function getValueInput() {
		//check conditions here and don't change address unless they match a wallet in database

		let inputValue = document.getElementById("search").value;
		
		inputValue = inputValue.replace(/\s+/g, ' ').trim(); // removes extra spaces

		if  (JsonObj.hasOwnProperty(inputValue)) {

		const nftTokenAddresses = JsonObj[inputValue]["mints"];
		document.getElementsByClassName("error")[0].innerHTML="";

		setAddress(inputValue);
		settokenAddresses(nftTokenAddresses);

		} else if (validateSolAddress(inputValue)) {

		document.getElementsByClassName("error")[0].innerHTML=
		"Wallet: <b>" + inputValue + "</b> wasn't holding any nfts at the time of snapshot";

		settokenAddresses([""]);
		setAddress("");

		} else if( inputValue.length > 0)  {
			document.getElementsByClassName("error")[0].innerHTML=
			"Incorrect Format Enter a valid Wallet Address";

		settokenAddresses([""]);
		setAddress("");

		} else {
			document.getElementsByClassName("error")[0].innerHTML=
			"type smth bozo";

		settokenAddresses([""]);
		setAddress("");
		}

	}

	function getRandom(arr, n) {
		var result = new Array(n),
			len = arr.length,
			taken = new Array(len);
		if (n > len)
			throw new RangeError("getRandom: more elements taken than available");
		while (n--) {
			var x = Math.floor(Math.random() * len);
			result[n] = arr[x in taken ? taken[x] : x];
			taken[x] = --len in taken ? taken[len] : len;
		}
		return result;
	}

	function SliceAndDice(token,st,en) {
		if (token != "") {
		return token.slice(0,st)+"..."+token.slice(-en);
		} else {
			return "Token Address";
		}
	  }

	  const onClickHandlerCheck = e => {
		
		var BtnObject = e.target;
		var eleval = BtnObject.closest("li").getAttribute("token-id");
		if (eleval == "") { return null;}
		// turn all data to skellies..
		var Pnode= (e.target).closest("li");
		var classfinder = BtnObject.getAttribute("class");

		if (classfinder != "done") {
			BtnObject.setAttribute("class",classfinder+" clicked");

			NFTsearch(eleval, Pnode);

			Pnode.getElementsByClassName("team-02__person_img")[0].onload = function () {
				BtnObject.setAttribute("class","done");
				BtnObject.setAttribute("value",'');
			};


		} else if (classfinder == "done"){
			BtnObject.setAttribute("class","clicked");
			BtnObject.setAttribute("value",'submit');
		}

		e.target.setAttribute("disabled", true);
	  }

	  function generateRandom(e) {
		var newval = getRandom(Object.keys(JsonObj), 1);
		document.getElementById("search").value = newval;
		getValueInput();
	}

   function validateSolAddress(address) {
		try {
			let pubkey = new PublicKey(address)
			let  isSolana =  PublicKey.isOnCurve(pubkey.toBuffer())
			return isSolana
		} catch (error) {
			return false
		}
	} 

	function getAmount(address) {
		try {
			let amount = JsonObj[address]["amount"];
		return ("amount: "+amount);
		} catch {
		  return [""];
		}
  }

  
async function NFTsearch(token,Pnode) {

		const options = {
			method: 'GET',
			url: 'https://solana-gateway.moralis.io/nft/mainnet/'+token+'/metadata',
			headers: {
			  accept: 'application/json',
			  'X-API-Key': 'Lza3p5nSkrTu8gMJm41CCySOIS40XFxdbUOCKeRjVcJJzd7Dl5MCjw0nYz8HJ2Bj'
			}
		  };

		  //
		  var xmlHttp = new XMLHttpRequest();
		  var element =Pnode.querySelector("#solscan");
		  xmlHttp.open( "GET", "https://public-api-test.solscan.io/token/holders?tokenAddress="+token+"&limit=1&offset=0", false ); // false for synchronous request
		  xmlHttp.send( null );
		   var result = JSON.parse(xmlHttp.responseText);
		   element.style.color = (result.data[0].owner == address) ? "#2f8611" : "#bf1e2e";
		  //

		  axios
			.request(options)
			.then(async function (response) {
				let uri = response.data.metaplex.metadataUri;
				await fetch(uri)
				.then((response) => response.json())
				.then((data) => {
					Pnode.querySelector(".collectio").innerHTML= ( 
						 (data.hasOwnProperty('collection')) ? data.collection.name : data.symbol //collection name/symbol
						 ); 
					Pnode.querySelector(".nameos").innerHTML=data.name; 							//name
					Pnode.querySelector(".description").innerHTML=data.description; 				//description
					Pnode.querySelector(".team-02__person_img").src =  data.image; 	//image
					Pnode.querySelector("#MagicEdenLink").href = "https://magiceden.io/item-details/" + token //magiceden link
					Pnode.querySelector("#solscan").href = "https://solscan.io/token/" + token; //solscan link
				});
			})
			.catch(function (error) {
			  console.error(error);
			});

	}

  return (
	<>
           {/* INPUT OUTSIDE UL MAIN */}
		   <div class="general-container">

		   <div class="inputz-container">
		    <input
			placeholder="Enter you wallet address"
            type="text"
			id="search"
			class="inputz"
			Value=""
			onChange={getValueInput}
			/>
			   <a class="tooltip-right" data-tooltip="generate a random addy!"><i class="fa fa-refresh fa-2x" aria-hidden="true" onClick={generateRandom}></i></a>
			   
		  </div>
			{/*<span class="amount">{getAmount(address)}</span>*/}
		  	<span class="error"></span>

		  </div>
		  
		  <ul class="team-02__list">
        {tokenAddresses.map(item => {
          return <li key={item} token-id={item} class="team-02__person">
		  <div class="team-02__person_box">
			 <div class="team-02__person_img_box">
				<img class="team-02__person_img"src="sss.svg" />
			 </div>

			 <div class="team-02__person_tag">
				<span class="tag color-main bg-light">
					<a id="solscan" href="javascript:;" target="_blank"> 
				<span class="tag__text">{SliceAndDice(item,16,10)}</span>
				</a>

				<a class="tooltip-right copyme" >
					<img width="14" height="14" src="copy-to-clipboard.svg" onClick={
						(e)=> (e.target).parentNode.setAttribute("data-tooltip","copied") 
					(navigator.clipboard.writeText(e.target.closest("li").getAttribute("token-id")))}
					 onMouseLeave={(e)=> e.target.parentNode.removeAttribute("data-tooltip")} alt="icon copy" /> </a>
				</span>
				<a class="tooltip-right" data-tooltip="If the Token Address is in (green) that means that wallet owner currently owns the NFT while if it is in (Red) that means he doesn't"><img class="more-info" src="https://cdn-icons-png.flaticon.com/512/8/8201.png"  /></a>

			 </div>

			 <div class="team-02__person_name nameos">nft name</div>
			 <div class="team-02__person_name collectio">collection name / symbol</div>

			 <div class="team-02__person_about content_box">
			 <p class="description">Collection description</p>
			<div></div>
			 <a id="MagicEdenLink" href="javascript:;" target="_blank">
				   <div class="new_button magiceden"> 
					  <img border="0" width="20" style={{margin: "unset"}}  src="meo.png" />
					  <span class="button__text">  Magic Eden</span>
				   </div>
			 </a>
			 
			 <input  onClick={onClickHandlerCheck} type="submit" value="reveal" role="submit" />
		</div>
		</div>
	   </li>
		  ;
        })}
     		</ul>
    </>
  );
};
export default App;


		{/*
			 <div class="inputContainer">
			 <i class="fa-brands fa-twitter"></i>
			 <input placeholder="@username" type="text" class="smaller-input" Value="" />
			</div>
		*/}