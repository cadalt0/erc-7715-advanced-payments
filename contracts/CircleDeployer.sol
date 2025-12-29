// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "./Circle.sol";

/**
 * @title CircleDeployer
 * @notice Dedicated deployer to keep CircleFactory runtime bytecode small
 */
contract CircleDeployer {
    function deployCircle(
        uint256 circleId,
        string memory circleName,
        address admin,
        address delegationManager,
        string memory adminTokenName,
        address adminTokenAddress,
        uint256 adminAmountGiven,
        uint256 adminExpiresAt
    ) external returns (address circleAddress) {
        Circle c = new Circle(
            circleId,
            circleName,
            admin,
            delegationManager,
            adminTokenName,
            adminTokenAddress,
            adminAmountGiven,
            adminExpiresAt
        );
        circleAddress = address(c);
    }
}
