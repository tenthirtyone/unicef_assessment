pragma solidity >=0.4.0 <0.6.0;

import "openzeppelin-solidity/contracts/ownership/Ownable.sol";
import "openzeppelin-solidity/contracts/lifecycle/Pausable.sol";


contract Users is Ownable, Pausable {

  mapping(address => bool) private users;

  event AddUser(address user);
  event RemoveUser(address user);

  modifier onlyUser() {
    require(users[msg.sender], "Users: Only a contract user may call this function");
    _;
  }

  constructor() public {
    addUser(msg.sender);
  }

  function addUser(address _user) public whenNotPaused onlyOwner {
    users[_user] = true;
    emit AddUser(_user);
  }

  function removeUser(address _user) public whenNotPaused onlyOwner {
    users[_user] = false;
    emit RemoveUser(_user);
  }

  function isUser(address _user) public view returns (bool) {
    return users[_user];
  }
}