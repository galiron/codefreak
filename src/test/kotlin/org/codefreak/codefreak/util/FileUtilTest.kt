package org.codefreak.codefreak.util

import java.io.File
import org.hamcrest.CoreMatchers.`is`
import org.hamcrest.MatcherAssert.assertThat
import org.hamcrest.Matchers.contains
import org.hamcrest.Matchers.empty
import org.junit.Assert
import org.junit.Test

class FileUtilTest {
  @Test
  fun `file name is normalized correctly`() {
    mapOf(
      "foo" to "foo",
      // keep leading/trailing slashes as they are valid in filenames
      " foo " to " foo ",
      // resulting path will contain the correct directory separator
      "foo/bar" to "foo" + File.separatorChar + "bar",
      ".foo" to ".foo",
      ".foo.bar" to ".foo.bar",
      ".foo/bar" to ".foo" + File.separatorChar + "bar",
      ".foo/.bar" to ".foo" + File.separatorChar + ".bar",
      "./" to "",
      "." to "",
      "../" to "",
      "../." to "",
      "../.." to "",
      ".././foo" to "foo",
      ".././foo//../bar" to "bar"
    ).forEach {
      Assert.assertEquals(it.value, FileUtil.sanitizePath(it.key))
    }
  }

  @Test
  fun `returns parent path`() {
    assertThat(FileUtil.getParentDir("foo/bar"), `is`("foo"))
    assertThat(FileUtil.getParentDir("foo"), `is`("/"))
    assertThat(FileUtil.getParentDir("/foo/bar"), `is`("/foo"))
    assertThat(FileUtil.getParentDir("/foo"), `is`("/"))
    assertThat(FileUtil.getParentDir("\\foo\\bar"), `is`("/foo"))
    assertThat(FileUtil.getParentDir("\\foo"), `is`("\\"))
  }

  @Test
  fun `returns parent paths`() {
    assertThat(FileUtil.getParentDirs("foo/bar/baz"), contains("foo/bar", "foo"))
    assertThat(FileUtil.getParentDirs("foo/bar"), contains("foo"))
    assertThat(FileUtil.getParentDirs("foo"), empty())
    assertThat(FileUtil.getParentDirs("/foo/bar/baz"), contains("/foo/bar", "/foo"))
    assertThat(FileUtil.getParentDirs("/foo/bar"), contains("/foo"))
    assertThat(FileUtil.getParentDirs("/foo"), empty())
  }
}
