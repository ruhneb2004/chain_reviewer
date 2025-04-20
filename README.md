# Chain Reviewer

This project is build to showcase the usage of blockchain to create a system that can be used for effectively administer the fair dealing for developers. They could be sure of what they could earn and never gets cheated out of it. The AI used here is just the google gemini's api, so you may how is still a necessary level of decentralization is ensured? Well the simple answer is **chainlink functions**. It's a really cool tool and the reason for this project to came to be was for me to test it out. You can read more about it and it's pretty cool.

### Disclaimer ‼️
I am not a professional smart contract dev and the smart contract used here hasn't been audicted so I would strongly advise you to not use this in any real world project involving real money, also the code written here dosen't completly follow the rules of preventing reduduncy and such. Also I wrote the code and tested it using remix and have just included it here.

## Overview 👀
A simple AI powered code reviewer in a trust minimised enviornment using blockchain

## Tech Used ⚙️
- **Next.js**: React framework for server-side rendering and routing.
- **Tailwind CSS**: Utility-first CSS framework for styling.
- **DaisyUI**: Tailwind CSS component library for UI components.
- **Viem**: Ethereum library for interacting with smart contracts.
- **Prisma**: ORM for database management.
- **TypeScript**: Typed superset of JavaScript for type safety.
- **Wagmi**: React hooks for Ethereum.

## 🧪 Getting Started

1. **Clone the repository**:
   ```bash
   git clone https://github.com/ruhneb2004/chain_reviewer.git
   cd chain_reviewer
   ```
2. **Install the dependencies**:
    ```bash
    npm install
    ```
3. ** Set up environment variables:**
   ```bash
   DATABASE_URL=your_database_url
   NEXT_PUBLIC_PROJECT_ID="your project id"
   NEXT_PUBLIC_INFURA_KEY=""
   ```
4.**Run database migrations**:
    ```bash
    npx prisma migrate dev
    ```
5.**Run the development server**:
  ```bash
  npm run dev
  ```

## Things to look out for

You can get the infura api key after logging into the infura website and just paste that there and the project id you might be looking for will be available in 
https://cloud.walletconnect.com/ just signin and look around, I am sure you will find it. Also in the env file, the variables that you are going to use in frontend needs to be prefixed with NEXT_PUBLIC. That's it all other things are pretty easy and you can figure it out yourself!


  
   
