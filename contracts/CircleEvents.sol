// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

library CircleEvents {
    event E1(uint256 indexed a, string b, address indexed c, address indexed d);
    event E2(uint256 indexed a, uint256 indexed b, bytes32 indexed c, uint256 d);
    event E3(uint256 indexed a, address indexed b, uint256 indexed c, string d, uint256 e, uint256 f);
    event E4(uint256 indexed a, address indexed b, string c, uint256 d, uint256 e);
    event E5(uint256 indexed a, address indexed b);
    event E6(uint256 indexed a, uint256 indexed b);
    event E7(uint256 indexed a, address indexed b, address indexed c, address d, uint256 e, address f);
}
