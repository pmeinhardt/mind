# $NAME

## How it works

Communication

…separate **Control Plane** and **Data Plane**.

1. The **Control Plane** uses a central server to manage sessions and make peers known to each other.
2. The **Data Plane** is peer-to-peer, meaning data flows directly between clients without passing through a central server.

Data moves directly between clients without a central server.

…client-generated key for each client, ensuring authentication of peers.
…signatures, prevent impersonation

client-generated session key, ensuring data can only be read by those you with who you shared the session link.

In detail

A client creates a session by generating a key pair (public/private keys). The public key is sent to the server. It is used to identify the session.
Peers (including the session creator) join the session by connecting to the server using the session ID (public key).
In order to join, a peer must sign a challenge from the server using the private part of the session key, proving they were invited.

In addition, each peer generates a temporary key pair for the session. The public part of this key is sent to the server and shared with all other peers in the session.
These key pairs are used to authenticate messages originating from each peer and preventing a peer to send messages on behalf of another peer.

…uses [Ed25519](https://en.wikipedia.org/wiki/EdDSA#Ed25519)
