// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

/**
 * @title ICircleFactory
 * @notice Interface for CircleFactory contract
 */
interface ICircleFactory {
    // State variables
    function circles(uint256 circleId) external view returns (address);
    function circleIds(address circleAddress) external view returns (uint256);
    function allCircles(uint256 index) external view returns (address);

    // Factory functions
    function deployCircle(
        string memory circleName,
        string memory adminTokenName,
        address adminTokenAddress,
        uint256 adminAmountGiven,
        uint256 adminExpiresAt
    ) external returns (uint256 circleId, address circleAddress);

    // View functions
    function getCircle(
        uint256 circleId
    ) external view returns (address circleAddress);

    function getCircleId(
        address circleAddress
    ) external view returns (uint256 circleId);

    function getTotalCircles() external view returns (uint256 count);

    function getAllCircles() external view returns (address[] memory addresses);
}

