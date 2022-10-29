# Yandex Managed Kubernetes provider

Pulumi-TS class implements provider for Managed Kubernetes Cluster in Yandex Cloud(Cloudil)

Usage:
```bash
npm i git@github.com:tessops/pulumi-yandex-k8s-provider.git#v0.1.0

```


```typescript
import YK8sProvider from "pulumi-yandex-k8s-provider";

const clusterName = "name-of-my-yandex-cluster"

const myProvider: pulumi.ProviderResource = YK8sProvider.getProvider(clusterName);

const myNamespace = new k8s.core.v1.Namespace("nsname", {
      metadata: {
        name: 'nsname"
      }
    }, {
      provider: myProvider,
    });


```

## Configuration

The provider takes two arguments

The `YK8sProvider.getProvider` method takes two arguments, `clusterName` and `namespace`.

`clusterName` is required.

Provider asumes that you also hgave those variables in your Pulumi.<stackname>.yaml to interact with YandexCloud(Cloudil) api:

```yaml
yandex:cloudId: <cloudId>
yandex:folderId: <folderId>
# In case of using Cloudil Cloud Provider you also need to add string below:
yandex:endpoint: api.cloudil.com:443

```

