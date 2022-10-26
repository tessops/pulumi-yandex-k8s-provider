"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const k8s = require("@pulumi/kubernetes");
const pulumi = require("@pulumi/pulumi");
const yandex = require("@pulumi/yandex");
const yaml = require("js-yaml");
class YK8sProvider {
    constructor(clusterName, namespace = "default") {
        const cluster = yandex.getKubernetesClusterOutput({ name: clusterName });
        this.cluster = pulumi
            .all([
            yandex.getKubernetesCluster({ name: clusterName })
        ])
            .apply(([c]) => {
            const rawCertArray = c.masters[0].clusterCaCertificate.split('\n');
            rawCertArray.splice(-2, 2);
            rawCertArray.splice(0, 1);
            const actualCertValue = rawCertArray.join('');
            // const base64CertValue = btoa(c.masters[0].clusterCaCertificate);
            const base64CertValue = Buffer.from(c.masters[0].clusterCaCertificate).toString('base64');
            return { kubeconfig: yaml.dump({
                    apiVersion: "v1",
                    kind: "Config",
                    preferences: {},
                    clusters: [
                        {
                            name: `yc-managed-k8s-${c.clusterId}`,
                            cluster: {
                                "certificate-authority-data": base64CertValue,
                                server: c.masters[0].externalV4Endpoint
                            },
                        },
                    ],
                    contexts: [
                        {
                            name: `yc-managed-k8s-${c.clusterId}`,
                            context: {
                                cluster: `yc-managed-k8s-${c.clusterId}`,
                                namespace: namespace,
                                user: `yc-managed-k8s-${c.clusterId}`,
                            },
                        },
                    ],
                    "current-context": `yc-managed-k8s-${c.clusterId}`,
                    users: [
                        {
                            name: `yc-managed-k8s-${c.clusterId}`,
                            user: {
                                exec: {
                                    apiVersion: "client.authentication.k8s.io/v1beta1",
                                    args: [
                                        "managed-kubernetes",
                                        "create-token",
                                    ],
                                    command: "yc"
                                },
                            },
                        },
                    ],
                })
            };
        });
        this.provider = new k8s.Provider("yc", { kubeconfig: this.cluster.kubeconfig });
    }
    getProvider() {
        return this;
    }
    static getProvider(clusterName, namespace = "default") {
        const slug = `${clusterName}-${namespace}`;
        if (!YK8sProvider.providers[slug]) {
            YK8sProvider.providers[slug] = new YK8sProvider(clusterName, namespace).getProvider();
        }
        return YK8sProvider.providers[slug];
    }
}
exports.YK8sProvider = YK8sProvider;
YK8sProvider.providers = {};
//# sourceMappingURL=index.js.map