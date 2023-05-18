// 定义函数 replaceBlockBlot，接收三个参数 blotName, imagePlaceholder, attributes
function replaceBlockBlot(blotName, imagePlaceholder, attributes = {}) {
	// 如果 attributes 未定义，则默认为空对象
	attributes = {
		...attributes,
		type: blotName, // 将 type 属性设置为 blotName
	}

	// 返回一个对象，包含 insert 和 attributes 两个属性
	return {
	// insert 属性是一个对象，包含一个 image 属性，值为 imagePlaceholder
		insert: {
			image: imagePlaceholder
		},
	// attributes 属性是一个对象，包含一个 data-custom 属性，值为 attributes 对象的键值对组成的字符串
		attributes: {
			'data-custom': Object.keys(attributes).map(key => `${key}=${attributes[key]}`).join('&')
		}
	}
}

// 该函数用于将 markdown 格式的链接从字符串中分离出来，返回一个数组。
function splitMarkdownLink(str) {
	// 定义正则表达式 isLinkReg，匹配 markdown 链接格式
	let isLinkReg = /\[[^\[\]\(\)]*?]\([^\[\]\(\)]*\)/g
	// 使用正则表达式匹配 str 中的链接
	let match = str.match(isLinkReg)
	let result = []

	// 如果没有匹配到链接，则将整个字符串作为文本处理
	if (!match) {
		result.push({
			type: 'text',
			value: str
		})
		return result
	}

	// 遍历匹配到的链接，将链接中的文本和链接地址分离出来，并将文本作为一个对象添加到 result 数组中。如果第一个链接前面还有文本，则将文本作为一个对象添加到 result 数组中。最后返回 result 数组。 
	for (let i = 0; i < match.length; i++) {
		// 取出第 i 个链接
		const link = match[i]
		// 使用正则表达式匹配链接中的文本和链接地址
		const [m, text, href] = link.match(/\[(.*)]\((.*)\)/)
		const strIndexOf = str.indexOf(link)

		// 如果第一个链接前面还有文本，则将文本作为一个对象添加到 result 数组中
		if (i === 0 && strIndexOf > 0) {
			result.push({
				type: 'text',
				value: str.substring(0, strIndexOf)
			})
		}

		// 将链接作为一个对象添加到 result 数组中
		result.push({
			type: 'link',
			value: text,
			href
		})
		
		const nextLink = match[i + 1]
		// 如果下一个链接存在，则计算下一个链接的起始位置和文本的起始位置，并将文本作为一个对象添加到 result 数组中。
		if (!nextLink) continue

		// 计算下一个链接的起始位置
		const nextLinkIndexOf = str.indexOf(nextLink)
		// 计算下一个链接后面的文本的起始位置
		const nextTextStartOf = strIndexOf + link.length

		// 如果第 i 个链接后面还有文本，则将文本作为一个对象添加到 result 数组中
		result.push({
			type: 'text',
			value: str.substring(nextTextStartOf, nextLinkIndexOf)
		})
	}
	// 遍历完所有链接后，将最后一个链接后面的文本作为一个对象添加到 result 数组中，并返回 result 数组。 
	return result
}

// 该函数的作用是将 delta 中的格式转换为微信小程序可识别的delta格式，返回新的 Delta 对象。
// 小程序中无法识别 link、background、unlockContent 等格式或属性，因此需要将这些格式转换为小程序可识别的格式与属性。
export function translateInputContent(delta) {
	// 定义一个空数组 newDelta
	let newDelta = []
	// 遍历 delta.ops 数组
	for (const item of delta.ops) {
		// delta.ops 数组中的每个元素都是一个对象，包含 insert 和 attributes 两个属性

		// 兼容 background，如果 item.attributes 中有 background 属性，则将其改为 backgroundColor
		if (item.attributes && item.attributes.background) {
			item.attributes.backgroundColor = item.attributes.background
		}

		// 纯字符串单独处理
		if (typeof item.insert === "string") {
			// 把链接转换为markdown格式
			if (item.attributes && item.attributes.link) {
				// 如果 item.attributes 中有 link 属性，则将 item.insert 转换为 markdown 链接格式，并添加到 newDelta 数组中
				newDelta.push({
					...item,
					insert: `[${item.insert}](${item.attributes.link})`
				})
			} else {
				// 如果 item.attributes 中没有 link 属性，则将 item 直接添加到 newDelta 数组中
				newDelta.push(item)
			}
			continue
		}


		// 文章付费解锁模块，转换为图片
		if (item.insert.unlockContent) {
			// 将 item.insert.unlockContent 转换为图片格式，并添加到 newDelta 数组中。
			// 图片的 base64 编码和其他属性已经在后面的代码中定义好了。
			newDelta.push(
				replaceBlockBlot(
					'unlockContent',
					'data:image/png;base64,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',
					{},
				)
			)
		} else {
			newDelta.push(item)
		}
	}

	// 遍历完所有元素后，返回新的 Delta 对象。
	return {
		ops: newDelta
	}
}

// 该函数的作用是将微信小程序可识别的 delta 格式转换为标准的delta格式，返回新的 Delta 对象。
export function translateOutputContent(delta) {
	// 定义一个空数组 newDelta
	let newDelta = []
	// 遍历 delta.ops 数组中的每一个元素
	for (const item of delta.ops) {
		// 如果 item.insert 是字符串类型
		if (typeof item.insert === "string") {
			// 调用 splitMarkdownLink 函数，将 item.insert 拆分成多个文本块
			const splitText = splitMarkdownLink(item.insert)

			// 如果 item.attributes.backgroundColor 存在
			// 将 item.attributes.background 赋值为 item.attributes.backgroundColor
			if (item.attributes && item.attributes.backgroundColor) {
				item.attributes.background = item.attributes.backgroundColor
			}

			// 遍历 splitText 数组中的每一个元素
			for (const textItem of splitText) {
				// 根据 textItem.type 的值，将不同类型的文本块转换为不同的格式
				switch (textItem.type) {
					default:
					case 'text':
						newDelta.push({
							attributes: item.attributes || {},
							insert: textItem.value
						})
						break
					case 'link':
						newDelta.push({
							attributes: {
								...(item.attributes || {}),
								link: textItem.href
							},
							insert: textItem.value
						})
						break
				}
			}
			continue
		}

		// 如果 item.insert 是图片类型，可能存在自定义格式
		if (item.insert.image) {
			// 将 item.attributes['data-custom'] 按照 & 符号拆分成多个键值对
			const customData = (item?.attributes?.['data-custom'] ?? '').split('&').reduce((res, item) => {
				const [key, value] = item.split('=')
				res[key] = value
				return res
			}, {})

			// 如果 customData.type 的值为 'unlockContent'，转换为看广告解锁格式
			if (customData.type === 'unlockContent') {
				newDelta.push({
					insert: {
						unlockContent: true
					}
				})
			} else {
				newDelta.push(item)
			}
		} else {
			newDelta.push(item)
		}
	}

	// 返回一个对象，包含属性 ops，值为 newDelta 数组
	return {
		ops: newDelta
	}
}

