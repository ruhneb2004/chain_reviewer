// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8.19;

import {FunctionsRequest} from "@chainlink/contracts@1.3.0/src/v0.8/functions/v1_0_0/libraries/FunctionsRequest.sol";
import {FunctionsClient} from "@chainlink/contracts@1.3.0/src/v0.8/functions/v1_0_0/FunctionsClient.sol";

error rewardNotMatchingAmountFunded();
error jobAlreadyAssigned();
error noJobsToAssign();
error noJobAssigned();
error callFailed();
error invalidFunding();
error jobNotComplete();
error developerNotFound();

event JobAssigned(address indexed assigner, string title, string desc, uint256 reward, string repo_link);

event JobAmountCalculated(address indexed dev, uint256 amount);

event JobApproved(address indexed assigner, address indexed developer);

event JobCompleted(address indexed developer, string repo_link, uint256 amount);

event JobAccepted(address indexed assigner, address indexed developer);

event WithdrawnAssignerAmount(address indexed assigner, uint256 amount);

event WithdrawnDevAmount(address indexed developer, uint256 amount);

event DevCancelledJob(address indexed developer, address indexed assigner);

event AssignerCancelledJob(address indexed assigner, string title);

contract ReviewerContract is FunctionsClient {
    using FunctionsRequest for FunctionsRequest.Request;

    struct Job {
        string title;
        string desc;
        uint256 reward;
        string repo_link;
    }

    mapping(address => Job) public assignerToJobs;
    mapping(address => Job) public devToJob;
    mapping(address => uint256) public assignerToLockedBalance;
    mapping(address => uint256) public assignerToWithdrawableBalance;
    mapping(address => uint256) public devToLockedBalance;
    mapping(address => uint256) public devToWithdrawableBalance;
    mapping(address => address) public assignerToDev;
    mapping(address => address) public devToAssigner;
    mapping(bytes32 => address) public requestIdToDev;
    mapping(address => bool) public devToJobStatus;

    address router = 0xb83E47C2bC239B3bf370bc41e1459A34b41238D0;
    bytes32 lastRequestId;
    uint32 gasLimit = 300000;
    bytes lastError;

    string source = "const apiResponse = await Functions.makeHttpRequest({"
        "url: `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=AIzaSyDtdofdsvh1KxLpeAHiD6dqcT2XPJEG3PE`,"
        "method: \"POST\"," "headers: {" "\"Content-Type\": \"application/json\"" "}," "data: {" "contents: [" "{"
        "role: \"user\","
        "parts: [{ text: `You are an expert software code reviewer. Given a description of a required code change, and two GitHub repository links (or commit links) one before and one after the change evaluate how well the developer implemented the described change. Focus strictly on: Accuracy of implementation Code completeness Code quality Return a single integer score from 0 to 100 based on how well the implementation matches the description. Output only the score. Do not include any explanation or feedback. Description: ${args[0]} Before Repo URL: ${args[1]} After Repo URL: ${args[2]}` }]"
        "}" "]" "}" "});" "if (apiResponse.error) {" "console.error(\"Gemini API Error:\", apiResponse.error);"
        "throw Error(\"Request failed\");" "}" "const { data } = apiResponse;"
        "console.log(\"API response data:\", JSON.stringify(data, null, 2));"
        "const text = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? \"\";"
        "const score = parseInt(text.match(/\\d+/)?.[0] || \"0\");" "return Functions.encodeUint256(score);";

    bytes32 donID = 0x66756e2d657468657265756d2d7365706f6c69612d3100000000000000000000;

    constructor() FunctionsClient(router) {}

    function sendRequest(uint64 subId, string[] memory args) internal returns (bytes32 reqId) {
        FunctionsRequest.Request memory req;
        req.initializeRequestForInlineJavaScript(source);
        if (args.length > 0) req.setArgs(args);

        lastRequestId = _sendRequest(req.encodeCBOR(), subId, gasLimit, donID);
        requestIdToDev[lastRequestId] = msg.sender;
        return lastRequestId;
    }

    function fulfillRequest(bytes32 requestId, bytes memory response, bytes memory err) internal override {
        if (lastRequestId != requestId) {
            revert();
        }
        address dev = requestIdToDev[requestId];

        if (dev == address(0)) revert developerNotFound();

        bytes memory res = response;
        uint256 score = abi.decode(res, (uint256));

        uint256 amount = devToJob[dev].reward * score / 100;
        devToLockedBalance[dev] += amount;

        emit JobAmountCalculated(dev, amount);

        lastError = err;
    }

    function assignJob(string calldata _title, string calldata _desc, uint256 _reward, string calldata _repo_link)
        public
        payable
    {
        if (msg.value != _reward) revert rewardNotMatchingAmountFunded();
        if (bytes(assignerToJobs[msg.sender].title).length != 0) revert jobAlreadyAssigned();
        Job memory newJob;
        newJob.title = _title;
        newJob.desc = _desc;
        newJob.reward = _reward;
        newJob.repo_link = _repo_link;
        assignerToWithdrawableBalance[msg.sender] += msg.value;

        assignerToJobs[msg.sender] = newJob;

        emit JobAssigned(msg.sender, _title, _desc, _reward, _repo_link);
    }

    function approveDeveloper(address _dev) public {
        if (bytes(assignerToJobs[msg.sender].title).length == 0) revert noJobsToAssign();
        if (bytes(devToJob[_dev].title).length != 0) revert jobAlreadyAssigned();
        devToJob[_dev] = assignerToJobs[msg.sender];
        assignerToWithdrawableBalance[msg.sender] -= assignerToJobs[msg.sender].reward; //locking the amount up for the assigner!
        assignerToLockedBalance[msg.sender] += assignerToJobs[msg.sender].reward;
        assignerToDev[msg.sender] = _dev;
        devToAssigner[_dev] = msg.sender;

        emit JobApproved(msg.sender, _dev);
    }

    function withdrawAssigner() public {
        uint256 amount = assignerToWithdrawableBalance[msg.sender];
        assignerToWithdrawableBalance[msg.sender] = 0;
        (bool success,) = msg.sender.call{value: amount}("");
        if (!success) {
            revert callFailed();
        }
        emit WithdrawnAssignerAmount(msg.sender, amount);
    }

    function withdrawDev() public {
        uint256 amount = devToWithdrawableBalance[msg.sender];
        devToWithdrawableBalance[msg.sender] = 0;
        (bool success,) = msg.sender.call{value: amount}("");
        if (!success) {
            revert callFailed();
        }
        emit WithdrawnDevAmount(msg.sender, amount);
    }

    //this is a demo function I have to implement it using the chainlink functions
    function getAiScore(uint64 _subId) public {
        if (bytes(devToJob[msg.sender].title).length == 0) revert noJobAssigned();
        if (!devToJobStatus[msg.sender]) revert jobNotComplete();
        address assigner = devToAssigner[msg.sender];
        string[] memory args = new string[](3);
        args[0] = devToJob[msg.sender].desc;
        args[1] = assignerToJobs[assigner].repo_link;
        args[2] = devToJob[msg.sender].repo_link;
        sendRequest(_subId, args);
    }

    //First I have to complete the job and then call the getAiScore!
    function completeJob(string calldata _repo_link) public {
        if (bytes(devToJob[msg.sender].title).length == 0) revert noJobAssigned();
        devToJob[msg.sender].repo_link = _repo_link;
        devToJobStatus[msg.sender] = true;
    }

    function acceptJobCompletion() public {
        if (bytes(assignerToJobs[msg.sender].title).length == 0) revert noJobAssigned();
        address _dev = assignerToDev[msg.sender];
        devToWithdrawableBalance[_dev] += devToLockedBalance[_dev];
        devToLockedBalance[_dev] = 0;
        assignerToWithdrawableBalance[msg.sender] +=
            assignerToLockedBalance[msg.sender] - devToWithdrawableBalance[_dev];
        assignerToLockedBalance[msg.sender] = 0;
        delete assignerToJobs[msg.sender];
        delete devToJob[_dev];
        delete devToAssigner[_dev];
        emit JobAccepted(msg.sender, _dev);
    }

    function devCancelJob() public {
        address assigner = devToAssigner[msg.sender];
        if (assigner == address(0)) revert noJobAssigned();
        assignerToWithdrawableBalance[assigner] += assignerToLockedBalance[assigner];
        assignerToLockedBalance[assigner] = 0;

        delete devToAssigner[msg.sender];
        delete assignerToDev[assigner];
        delete devToJob[msg.sender];
        emit DevCancelledJob(msg.sender, assigner);
    }

    //only possible is no dev hasnt taken on the job yet!
    function assignerCancelsJob() public {
        if (assignerToDev[msg.sender] != address(0)) revert jobAlreadyAssigned();
        emit AssignerCancelledJob(msg.sender, assignerToJobs[msg.sender].title);
        delete assignerToJobs[msg.sender];
    }

    //we will just let them withdraw the amount!
    fallback() external payable {
        if (bytes(assignerToJobs[msg.sender].title).length != 0) revert invalidFunding();
        assignerToWithdrawableBalance[msg.sender] += msg.value;
    }

    receive() external payable {
        if (bytes(assignerToJobs[msg.sender].title).length != 0) revert invalidFunding();
        assignerToWithdrawableBalance[msg.sender] += msg.value;
    }
}
