<!--
This file is autogenerated based on
https://github.com/PolymerElements/ContributionGuide/blob/master/CONTRIBUTING.md

If you edit that file, it will get updated everywhere else.
If you edit this file, your changes will get overridden :)

# Polymer Elements
## Guide for Contributors

Polymer Elements are built in the open, and the Polymer authors eagerly encourage any and all forms of community contribution. When contributing, please follow these guidelines:

### Filing Issues

**If you are filing an issue to request a feature**, please provide a clear description of the feature. It can be helpful to describe answers to the following questions:

 1. **Who will use the feature?** _“As someone filling out a form…”_
 2. **When will they use the feature?** _“When I enter an invalid value…”_
 3. **What is the user’s goal?** _“I want to be visually notified that the value needs to be corrected…”_

**If you are filing an issue to report a bug**, please provide:

 1. **A clear description of the bug and related expectations.** Consider using the following example template for reporting a bug:

 ```markdown
 The `paper-foo` element causes the page to turn pink when clicked.

 ## Expected outcome

 The page stays the same color.

 ## Actual outcome

 The page turns pink.

 ## Steps to reproduce

 1. Put a `paper-foo` element in the page.
 2. Open the page in a web browser.
 3. Click the `paper-foo` element.
 ```

 2. **A reduced test case that demonstrates the problem.** If possible, please include the test case as a JSBin. Start with this template to easily import and use relevant Polymer Elements: [https://jsbin.com/cagaye/edit?html,output](https://jsbin.com/cagaye/edit?html,output).


 3. **A list of browsers where the problem occurs.** This can be skipped if the problem is the same across all browsers.

### Submitting Pull Requests

**Before creating a pull request**, please ensure that an issue exists for the corresponding change in the pull request that you intend to make. **If an issue does not exist, please create one per the guidelines above**. The goal is to discuss the design and necessity of the proposed change with Polymer authors and community before diving into a pull request.

When submitting pull requests, please provide:

 1. **A reference to the corresponding issue** or issues that will be closed by the pull request. Please refer to these issues in the pull request description using the following syntax:


 ```markdown
 (For a single issue)
 Fixes #20

 (For multiple issues)
 Fixes #32, fixes #40

 ```

 2. **A succinct description of the design** used to fix any related issues. For example:

 ```markdown
 This fixes #20 by removing styles that leaked which would cause the page to turn pink whenever `paper-foo` is clicked.
 ```

 3. **At least one test for each bug fixed or feature added** as part of the pull request. Pull requests that fix bugs or add features without accompanying tests will not be considered.

If a proposed change contains multiple commits, please [squash commits](https://www.google.com/url?q=http://blog.steveklabnik.com/posts/2012-11-08-how-to-squash-commits-in-a-github-pull-request) to as few as is necessary to succinctly express the change. A Polymer author can help you squash commits, so don’t be afraid to ask us if you need help with that!
