package org.codefreak.codefreak.cloud.model

import com.fasterxml.jackson.annotation.JsonIgnore
import com.fkorotkov.kubernetes.networking.v1.backend
import com.fkorotkov.kubernetes.networking.v1.http
import com.fkorotkov.kubernetes.networking.v1.metadata
import com.fkorotkov.kubernetes.networking.v1.newHTTPIngressPath
import com.fkorotkov.kubernetes.networking.v1.newIngressRule
import com.fkorotkov.kubernetes.networking.v1.port
import com.fkorotkov.kubernetes.networking.v1.service
import com.fkorotkov.kubernetes.networking.v1.spec
import io.fabric8.kubernetes.api.model.networking.v1.Ingress
import org.codefreak.codefreak.cloud.KubernetesWorkspaceConfig
import org.codefreak.codefreak.cloud.isDefaultPort
import org.codefreak.codefreak.util.withoutLeadingSlash
import org.codefreak.codefreak.util.withoutTrailingSlash

class CompanionIngress(private val wsConfig: KubernetesWorkspaceConfig) : Ingress() {
  init {
    metadata {
      name = wsConfig.companionIngressName
      labels = wsConfig.getLabelsForComponent("companion")
      annotations = mapOf(
          "nginx.ingress.kubernetes.io/rewrite-target" to "/$2",
          "nginx.ingress.kubernetes.io/proxy-body-size" to "10m"
      )
    }
    spec {
      rules = listOf(newIngressRule {
        host = getHostName()
        http {
          paths = listOf(newHTTPIngressPath {
            pathType = "Prefix"
            path = "/${getBasePath()}(/|\$)(.*)"
            backend {
              service {
                name = wsConfig.companionServiceName
                port {
                  name = "http"
                }
              }
            }
          })
        }
      })
    }
  }

  private fun getBasePath(): String {
    val defaultPath = "ws-${wsConfig.workspaceId}"
    val path = if (wsConfig.baseUrl.path.isNotEmpty()) {
      "${wsConfig.baseUrl.path.withoutTrailingSlash()}/$defaultPath"
    } else {
      defaultPath
    }
    return path.withoutTrailingSlash().withoutLeadingSlash()
  }

  private fun getHostName(): String {
    return wsConfig.baseUrl.host
  }

  private fun getHostNameWithPort(): String {
    if (wsConfig.baseUrl.isDefaultPort) {
      return wsConfig.baseUrl.host
    }
    return wsConfig.baseUrl.host + ":" + wsConfig.baseUrl.port
  }

  @JsonIgnore
  fun getBaseUrl(): String {
    return "${wsConfig.baseUrl.protocol}://${getHostNameWithPort()}/${getBasePath()}/"
  }
}
