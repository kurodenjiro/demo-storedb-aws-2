# demo-storedb-aws-1

Repo demo của **Sponsored Compute**: repo mang theo tài trợ, không mang theo bí mật.

## Dành cho developer

```bash
git clone https://github.com/kurodenjiro/demo-storedb-aws-1
cd demo-storedb-aws-1
```

Mở Claude Code trong thư mục này rồi hỏi:

> dự án này có tài trợ không?

Agent sẽ đọc `sponsored.json`, **verify campaign on-chain**, và hỏi bạn trước khi claim.
Claim xong, Grant thuộc về ví của bạn — mỗi ví một `projectId`, fork lại không nhân bản được tiền.

## Hai file trong repo

| File | Là gì |
|---|---|
| `sponsored.json` | Con trỏ tới campaign. **Không phải giấy phép.** Không chứa key, ví, hay địa chỉ contract. |
| `.mcp.json` | Khai báo MCP server để Claude Code tự nạp khi mở project. |

Tiền nằm trong `GrantManager` trên Avalanche Fuji. Hạn mức mỗi giao dịch, mỗi ngày,
danh sách merchant được phép nhận, và hạn dùng đều do contract giữ — không do file này.
