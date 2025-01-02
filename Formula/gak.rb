class Gak < Formula
  desc "Global Awesome Keywords - A powerful multi-keyword search tool"
  homepage "https://github.com/8bit-wraith/gak"
  url "https://github.com/8bit-wraith/gak/archive/refs/tags/v1.0.0.tar.gz"
  sha256 "YOUR_TARBALL_SHA256" # We'll need to update this after first release
  license "MIT"

  depends_on "node"

  def install
    system "npm", "install", *Language::Node.std_npm_install_args(libexec)
    bin.install_symlink Dir["#{libexec}/bin/*"]
  end

  test do
    (testpath/"test.txt").write "test content"
    assert_match "test content", shell_output("#{bin}/gak test #{testpath}/test.txt")
  end
end 