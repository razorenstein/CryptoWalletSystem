<h1 style="text-align: center;">Crypto Wallet System</h1>

<hr/>

<h2>Project Overview</h2>
<p>
  The <strong>Crypto Wallet System</strong> is a robust backend application built using NestJS, 
  designed to empower users in managing their cryptocurrency holdings. This system offers features to view current valuations, 
  perform various operations on wallets, and much more.
</p>
<p>
  The project follows a monorepo structure with two primary microservices and a shared library:
</p>
<ul>
  <li>
    <strong>Wallet Service</strong>: This service handles user wallets, offering full CRUD operations on wallets and assets. 
    It calculates the total value of a wallet or aggregate value across multiple wallets by fetching asset rates data from the Rate Service.
  </li>
  <li>
    <strong>Rate Service</strong>: This service integrates seamlessly with the external CoinGecko API to fetch current cryptocurrency rates. 
    It employs efficient caching mechanisms, including periodic cache refreshes and removal of the oldest cache items to optimize performance.
  </li>
  <li>
    <strong>Shared Library</strong>: The shared library is the core of the Crypto Wallet System, containing reusable code and resources 
    shared across both microservices. It centralizes common logic, models, utilities, and exceptions, promoting consistency and maintainability 
    throughout the project.
  </li>
</ul>

<hr/>

<h2>Setup</h2>

<h3>Prerequisites</h3>
<ul>
  <li><strong>Node.js</strong> (version 14 or above)</li>
  <li><strong>npm</strong> (version 6 or above)</li>
</ul>

<h3>Installation</h3>
<ol>
  <li>
    <strong>Clone the Repository:</strong>
    <pre><code>git clone https://github.com/razorenstein/CryptoWalletSystem.git<br/>cd crypto-wallet-system-oobit</code></pre>
  </li>
  <li>
    <strong>Install Dependencies:</strong>
    <pre><code>npm install</code></pre>
  </li>
  <li>
    <strong>Build the Project:</strong>
    <pre><code>npm run build</code></pre>
  </li>
  <li>
    <strong>Run Both Applications:</strong>
    <pre><code>npm run start:all</code></pre>
  </li>
</ol>

<h3>Running Tests</h3>
<p>To run the tests:</p>
<pre><code>npm run test</code></pre>

<h3>Postman Collection</h3>
<p>
  The Postman collection is available in the <code>./postman</code> directory. It is highly recommended to import it into Postman for testing and 
  interacting with the API endpoints.
</p>

<hr/>

<h2>Wallet Ownership and Validation</h2>

<h3>Wallet Ownership</h3>
<p>
  Users must own a wallet to access it. The system enforces ownership by checking the ownership of a wallet before allowing any operations, 
  such as adding or removing assets, retrieving wallet details, or calculating values. Only the owner of a wallet can perform actions on it.
</p>

<h3>Request Validation</h3>
<p>
  Users are required to include the <code>X-USER-ID</code> header in their requests. A dedicated middleware validates this header, ensuring that only 
  valid and authorized requests are processed. Also validity of other params is checked like currency, assetid etc.
</p>

<hr/>

<h2>Error Handling and Exceptions</h2>
<p>
  The system employs custom exceptions to provide clear and consistent error messages, ensuring that clients receive meaningful feedback. 
  These exceptions are standardized across the application, making error handling predictable and uniform.
</p>

<h3>Common Exceptions</h3>
<ul>
  <li><strong>AssetNotFoundException</strong>: Thrown when the specified asset is not found in the wallet.</li>
  <li><strong>FileOperationException</strong>: Thrown when an error occurs during file operations (e.g., reading or writing files).</li>
  <li><strong>InvalidUserIdException</strong>: Thrown when the provided <code>X-USER-ID</code> header is invalid or not found.</li>
  <li><strong>WalletAlreadyExistsException</strong>: Thrown when a wallet with the specified ID already exists for the user.</li>
  <li><strong>WalletNotFoundException</strong>: Thrown when the requested wallet is not found for the given user.</li>
  <li><strong>UnauthorizedWalletAccessException</strong>: Thrown when a user attempts to access a wallet that they do not own.</li>
  <li><strong>UnsupportedCurrencyException</strong>: Thrown when a user requests a currency that is not supported by the system.</li>
  <li><strong>InsufficientAssetAmountException</strong>: Thrown when a user attempts to remove more of an asset than they hold in their wallet.</li>
  <li><strong>ApiCallFailedException</strong>: Thrown when a call to an external API fails.</li>
</ul>
