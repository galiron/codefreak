package org.codefreak.codefreak.config

import javax.validation.constraints.NotBlank
import javax.validation.constraints.NotEmpty
import org.codefreak.codefreak.auth.AuthenticationMethod
import org.codefreak.codefreak.auth.Role
import org.jetbrains.annotations.NotNull
import org.springframework.boot.context.properties.ConfigurationProperties
import org.springframework.core.io.Resource
import org.springframework.stereotype.Component
import org.springframework.validation.annotation.Validated

@Component("config")
@ConfigurationProperties(prefix = "codefreak")
@Validated
class AppConfiguration {

  /** Identifier of the Code FREAK instanceId. Set this if you run multiple instances on the same Docker host. */
  lateinit var instanceId: String
  var authenticationMethod = AuthenticationMethod.SIMPLE

  val workspaces = Workspaces()
  val ldap = Ldap()
  val files = Files()
  val lti = Lti()
  val evaluation = Evaluation()
  val gitImport = GitImport()

  class Workspaces {
    /**
     * Kubernetes namespace where new workspaces will be created in.
     * Running multiple instances of Code FREAK in the same namespace is NOT supported and might lead
     * to data corruption or invalid states.
     */
    var namespace = "default"

    /**
     * Base URL that will be used to create Ingress resources for workspaces.
     * Must accept a single variable `{workspaceIdentifier}` that
     * will be replaced by the actual random workspace id.
     * Make sure the hostname points to your ingress LoadBalancer.
     * The template can also be used to create hostname-based URLs.
     * Make sure you do not exceed the max allowed characters per domain (RFC 1034).
     *
     * ```
     * baseUrlTemplate: "http://{workspaceIdentifier}.ws.mydomain.com"
     * baseUrlTemplate: "https://mydomain.com/ws/{workspaceIdentifier}"
     * ```
     */
    var baseUrlTemplate = "http://localhost/{workspaceIdentifier}"

    /**
     * Full image name that will be used for the workspace companion
     */
    var companionImage = "ghcr.io/codefreak/codefreak-cloud-companion:minimal"
  }

  class Ldap {
    var url: String? = null
    var rootDn: String? = null
    var activeDirectory = false
    var firstNameAttribute: String? = "sn"
    var lastNameAttribute: String? = "givenName"
    var roleMappings: Map<String, Role> = mapOf()
    var userSearchBase = "ou=people"
    var userSearchFilter = "(uid={0})"
    var groupSearchBase = "ou=groups"
    var groupSearchFilter = "member={0}"

    /** Manually set the roles for a specific username */
    var overrideRoles: Map<String, Role> = mapOf()
    var forceLdapRoles = true
  }

  class Files {
    var adapter = FileAdapter.JPA
    val fileSystem = FileSystem()

    enum class FileAdapter {
      JPA,
      FILE_SYSTEM
    }

    class FileSystem {
      lateinit var collectionStoragePath: String
    }
  }

  class Lti {
    var enabled: Boolean = false
    @NotNull var keyStore: Resource? = null
    var keyStorePassword: String? = null
    var keyStoreType = "jceks"
    @NotEmpty var providers = arrayListOf<LtiProvider>()

    class LtiProvider {
      var name: String? = null
      @NotBlank var issuer: String? = null
      @NotBlank var clientId: String? = null
      @NotBlank var authUrl: String? = null
      @NotBlank var tokenUrl: String? = null
      @NotBlank var jwkUrl: String? = null
      @NotBlank var keyStoreEntryName: String? = null
      var keyStoreEntryPin = ""
    }
  }

  class Evaluation {
    var maxConcurrentExecutions = Runtime.getRuntime().availableProcessors()
    var maxQueueSize = 1000
    var defaultTimeout = 5L * 60L
    // Use IDE image also for evaluation until cloud workspaces have been implemented
    var defaultImage = "cfreak/ide:1"
    var imageWorkdir = "/home/runner/project"
  }

  class GitImport {
    var remotes = arrayOf<GitRemote>()

    class GitRemote {
      var host = ""
      var sshBaseUrl = ""
      var sshKey = ""
      var sshKeyPass: String? = null
    }
  }
}
