---
cssclasses:
  - demo-wide
---
# Tricky syntax

Headings that are easy to get wrong.

## Code fences

```bash
# This is a shell comment, not a heading
echo "## Neither is this"
```

~~~markdown
## A heading inside a tilde fence is not a heading
~~~

## Formatting in **headings** with `code` and [[Project report|links]]

The picker should show the raw heading text.

## Closing hashes ##

ATX heading with closing hashes.

## Comments and HTML

%%
## A heading inside an Obsidian comment
%%

<div>
This is an HTML block.
</div>

## Maths block

$$
\#\text{items} = 42
$$

## Empty section

## Heading with no body

## Setext headings

The setext H1 below is a real level 1 heading, so it starts a new top-level section in the picker (that is why this section is last).

Setext level 1
==============

Text under a setext H1.

Setext level 2
--------------

Text under a setext H2.
