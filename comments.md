# Code Review Feedback

1. Usually, `walletId` should be a UUID auto-generated and not passed via the API (then you wouldn't need to check if the wallet already exists).

2. `UserIdValidationMiddleware` should be a shared util/lib.

3. No need for `/dtos/requests`. `/dtos` is enough.

4. I wouldn't use multiple controllers/services in this case. If you feel each has a different domain, split into separate modules.

5. Try to be more consistent (have a convention for file/folder/class/method names).

6. Use interfaces instead of classes in cases like `UserAssetsTotalValue` and `WalletTotalValue`.

7. There are some mocks that are not in use. You can delete unused code.

8. Specific file tests should reside near that file. Global tests should reside in the root. Same reasoning for constants, utils, interfaces, etc.

9. Custom exceptions are nice, but I wouldn't waste time on them. You can just use `HttpException`. Also, you can be more specific and use `NotFoundException`, `BadRequestException`, etc.

10. Instead of `:walletId/rebalance`, use `rebalance/:walletId`. Same for other places.

11. You have many lint errors. Run `npm run lint`.

12. You have many format fixes. Run `npm run format`.

13. Please use `npm-check-updates` and upgrade all dependencies.

14. You've created a shared `wallet-file-management.service`. I think you should create a generic file management service instead of one specific to wallets, because it loses the idea of shared modules.

15. You're working with separate files for each wallet. I would use a single file for each DB table (i.e., for all wallets).

16. When you create a wallet, you both `addUserWallet` and `saveWallet`. Why is the `addUserWallet` needed?

17. Instead of `cryptoAssets: CryptoAsset[]`, I would use `cryptoAssets: {[assetId: string]: number}`.

18. Instead of returning a response like this:
    ```typescript
    export class RateResponseDto {
        rates: Rate[];
    }
    ```
    I would return just `Rate[]` (without the rates object key).

19. I would try to create a util for: `await firstValueFrom(this.httpService.get)` instead of repeating it.