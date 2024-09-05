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
    
    User can create a wallet (default amount of posible wallets per users is 1 but it's configurable in config file).
    After User creates a wallet he can Add assets, remove assets, rebalance them, get their wallet actual amounts in a specific currency and more.
    Notice that a supported Asset Ids and currencies list are available also as endpoints.
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
    <pre><code>git clone https://github.com/razorenstein/CryptoWalletSystem.git</code></pre>
  </li>
  <li>
    <strong>Navigate to the project directory:</strong>
    <pre><code>cd CryptoWalletSystem</code></pre>
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
  valid and authorized requests are processed. If the header is missing or invalid, the request is rejected, and an appropriate exception is thrown.
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

<hr/>

<h2>Approach Explanation</h2>
<p>
  The development approach for the Crypto Wallet System was methodical and deliberate, starting with a clear understanding of the required behaviors and functionalities.
  Initially, I focused on <strong>modeling all the behaviors</strong> that the system needed to support. This involved creating detailed <strong>models of the objects</strong>
  that represent the core entities of the application, such as wallets, assets, and rates.
</p>
<p>
  With the object models in place, the next step was to design the <strong>APIs</strong> that would expose these functionalities. I carefully considered how to structure
  the APIs to be intuitive and efficient, ensuring that they align well with RESTful principles. Throughout this process, I emphasized <strong>separation of concerns</strong> by clearly delineating the responsibilities of each microservice, ensuring that each service is focused on a specific domain.
</p>
<p>
  Another key focus was on <strong>shared functionality</strong>. I identified common patterns and utilities that could be reused across the microservices and implemented
  them in a shared library. This approach not only promotes code reuse but also ensures that the application remains modular and easy to maintain.
</p>
<p>
  Finally, I prioritized <strong>good project organization</strong>. The monorepo structure, combined with a well-organized shared library, facilitates collaboration and 
  scalability, while also making the project easier to navigate for developers.
</p>
