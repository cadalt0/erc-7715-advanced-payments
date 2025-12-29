// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "./interfaces/ICircleFactory.sol";
import "./interfaces/ICircle.sol";
import "./Circle.sol";
import "./CircleDeployer.sol";
import "./CircleEvents.sol";
import "./CircleErrors.sol";

/**
 * @title CircleFactory
 * @notice Factory contract for deploying Circle instances
 * @dev Anyone can deploy a new circle, and the deployer becomes the admin
 *      Implements ICircleFactory interface
 */
contract CircleFactory is ICircleFactory {
    // Counter for unique circle IDs
    uint256 private _nextCircleId;

    // Mapping from circle ID to circle address
    mapping(uint256 => address) public override circles;

    // Mapping from circle address to circle ID
    mapping(address => uint256) public override circleIds;

    // Array of all deployed circle addresses
    address[] public override allCircles;

    // DelegationManager address (set once, used for all circles)
    address public immutable delegationManager;

    // Deployer that actually creates Circle contracts (keeps factory bytecode small)
    CircleDeployer public immutable deployer;

    /**
     * @notice Constructor - sets the DelegationManager address
     * @param _delegationManager Address of the ERC-7715 DelegationManager contract
     */
    constructor(address _delegationManager) {
        if (_delegationManager == address(0)) revert InvalidAddress();
        delegationManager = _delegationManager;

        // Deploy a dedicated CircleDeployer to avoid embedding Circle creation bytecode
        deployer = new CircleDeployer();
    }

    /**
     * @notice Deploys a new Circle contract with admin auto-join
     * @param circleName Name of the circle to create
     * @param adminTokenName Token name for admin's initial permission
     * @param adminTokenAddress Address of the ERC-20 token contract
     * @param adminAmountGiven Amount of tokens admin is giving to the circle
     * @param adminExpiresAt Permission expiry timestamp (0 = no expiry)
     * @return circleId Unique identifier of the created circle
     * @return circleAddress Address of the deployed Circle contract
     */
    function deployCircle(
        string memory circleName,
        string memory adminTokenName,
        address adminTokenAddress,
        uint256 adminAmountGiven,
        uint256 adminExpiresAt
    ) external override returns (uint256 circleId, address circleAddress) {
        if (bytes(circleName).length == 0) revert InvalidName();
        if (adminTokenAddress == address(0)) revert InvalidAddress();
        if (adminAmountGiven == 0) revert InvalidAmount();

        circleId = _nextCircleId;
        _nextCircleId++;

        // Deploy new Circle contract via dedicated deployer
        circleAddress = deployer.deployCircle(
            circleId,
            circleName,
            msg.sender,
            delegationManager,
            adminTokenName,
            adminTokenAddress,
            adminAmountGiven,
            adminExpiresAt
        );

        // Store mappings
        circles[circleId] = circleAddress;
        circleIds[circleAddress] = circleId;
        allCircles.push(circleAddress);

        emit CircleEvents.E1(circleId, circleName, msg.sender, circleAddress);
    }

    /**
     * @notice Gets the address of a circle by ID
     * @param circleId ID of the circle
     * @return circleAddress Address of the circle contract
     */
    function getCircle(
        uint256 circleId
    ) external view override returns (address circleAddress) {
        circleAddress = circles[circleId];
        if (circleAddress == address(0)) revert InvalidAddress();
    }

    /**
     * @notice Gets the circle ID for a given circle address
     * @param circleAddress Address of the circle contract
     * @return circleId ID of the circle
     */
    function getCircleId(
        address circleAddress
    ) external view override returns (uint256 circleId) {
        circleId = circleIds[circleAddress];
        if (circleId == 0 && circleAddress != circles[0]) revert InvalidAddress();
    }

    /**
     * @notice Gets total number of deployed circles
     * @return count Total number of circles
     */
    function getTotalCircles() external view override returns (uint256 count) {
        count = allCircles.length;
    }

    /**
     * @notice Gets all deployed circle addresses
     * @return addresses Array of all circle addresses
     */
    function getAllCircles()
        external
        view
        override
        returns (address[] memory addresses)
    {
        addresses = allCircles;
    }
}
