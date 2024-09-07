# Code Review Feedback

1. Usually, `walletId` should be a UUID auto-generated and not passed via the API (then you wouldn't need to check if the wallet already exists).
V (Now creating a wallet generates uuid)
2. `UserIdValidationMiddleware` should be a shared util/lib.
V 
3. No need for `/dtos/requests`. `/dtos` is enough.
V
4. I wouldn't use multiple controllers/services in this case. If you feel each has a different domain, split into separate modules.
V (Merged user-assets, assets and wallet services/controllers to the wallet service/controller but I preferred that the supported-values will be independent so they have different modules now)
5. Try to be more consistent (have a convention for file/folder/class/method names).
V
6. Use interfaces instead of classes in cases like `UserAssetsTotalValue` and `WalletTotalValue`.
V
7. There are some mocks that are not in use. You can delete unused code.
V
8. Specific file tests should reside near that file. Global tests should reside in the root. Same reasoning for constants, utils, interfaces, etc.
V
9. Custom exceptions are nice, but I wouldn't waste time on them. You can just use `HttpException`. Also, you can be more specific and use `NotFoundException`, `BadRequestException`, etc.
V
10. Instead of `:walletId/rebalance`, use `rebalance/:walletId`. Same for other places.
V
11. You have many lint errors. Run `npm run lint`.
V
12. You have many format fixes. Run `npm run format`.
V
13. Please use `npm-check-updates` and upgrade all dependencies.
V
14. You've created a shared `wallet-file-management.service`. I think you should create a generic file management service instead of one specific to wallets, because it loses the idea of shared modules.
V (Absolutely agree)
15. You're working with separate files for each wallet. I would use a single file for each DB table (i.e., for all wallets).
V
16. When you create a wallet, you both `addUserWallet` and `saveWallet`. Why is the `addUserWallet` needed?
(I've changed the terminology but one  call is for saving the wallet id on the user table and the other is saving the wallet data and the wallet table)
17. Instead of `cryptoAssets: CryptoAsset[]`, I would use `cryptoAssets: {[assetId: string]: number}`.
V (I changed it but I think that CryptoAsset object potentially may have many fields so we get them for free that way on the wallet object)
18. Instead of returning a response like this:
    ```typescript
    export class RateResponseDto {
        rates: Rate[];
    }
    ```
    I would return just `Rate[]` (without the rates object key).
V
19. I would try to create a util for: `await firstValueFrom(this.httpService.get)` instead of repeating it.
V