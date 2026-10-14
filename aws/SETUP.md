# AWS setup for employee-app CI/CD

One-time setup. Region: **ap-southeast-2** (Sydney). Account: `490497822745`. Instance: `i-09e4cde3a0b687b3d`.

Do these in order. Once done, every push to `main` deploys automatically.

## 1. ECR repository

ECR → **Create repository**
- Visibility: **Private**
- Name: `employee-app`

Then open the repo → **Lifecycle policy** → **Edit JSON** → paste `ecr-lifecycle-policy.json`.

## 2. EC2 instance role (lets the instance pull images and receive SSM commands)

IAM → Roles → **Create role**
- Trusted entity: **AWS service** → **EC2**
- Policies: `AmazonEC2ContainerRegistryReadOnly`, `AmazonSSMManagedInstanceCore`
- Name: `ec2-employee-app`

EC2 → select the instance → **Actions → Security → Modify IAM role** → choose `ec2-employee-app`.

## 3. Security group

EC2 → instance → **Security** tab → security group → **Edit inbound rules**
- HTTP, port 80, source `0.0.0.0/0`
- SSH, port 22, source **My IP** only (delete any `0.0.0.0/0` rule on port 22)

## 4. Elastic IP

EC2 → Elastic IPs → **Allocate** → **Associate** with `i-09e4cde3a0b687b3d`. The site will be at `http://<elastic-ip>/`.

## 5. Prepare the instance

SSH in and run:

```bash
sudo snap install aws-cli --classic
sudo snap services amazon-ssm-agent    # should show "active"
aws sts get-caller-identity            # should show the ec2-employee-app role
```

Then in **Systems Manager → Fleet Manager**, the instance should appear as **Online** (may take a few minutes after attaching the role; `sudo snap restart amazon-ssm-agent` speeds it up).

## 6. GitHub OIDC provider

IAM → Identity providers → **Add provider**
- Type: **OpenID Connect**
- Provider URL: `https://token.actions.githubusercontent.com`
- Audience: `sts.amazonaws.com`

## 7. GitHub Actions role

IAM → Roles → **Create role** → **Custom trust policy** → paste `github-oidc-trust-policy.json`.
Skip adding managed policies, name it **`github-actions-employee-app`** (the workflow expects this exact name).

Open the role → **Add permissions → Create inline policy → JSON** → paste `github-actions-permissions.json`, name it `deploy-employee-app`.

The trust policy only allows the `main` branch of `sudhuxenia/sample`. If the repo is renamed or moved, update the `sub` value.

## 8. Run it

Push to `main`, or GitHub → **Actions → CI/CD → Run workflow**. Pull requests only run lint, test and build; they never deploy.

## Troubleshooting

| Error | Likely cause |
|---|---|
| `Not authorized to perform sts:AssumeRoleWithWebIdentity` | Step 6 missing, or the `sub` in the trust policy doesn't match the repo/branch |
| `InvalidInstanceId` from `send-command` | Instance isn't Online in Fleet Manager (step 2 role or step 5 agent) |
| `aws: command not found` in the SSM output | AWS CLI not installed on the instance (step 5) |
| `no basic auth credentials` on `docker pull` | Instance role missing `AmazonEC2ContainerRegistryReadOnly` |
| Site doesn't load but deploy succeeded | Port 80 not open in the security group (step 3) |
