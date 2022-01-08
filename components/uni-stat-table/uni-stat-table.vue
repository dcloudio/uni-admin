<template>
	<uni-table :loading="loading" border stripe :emptyText="$t('common.empty')">
		<uni-tr>
			<uni-th v-for="(field, index) in filedsMap" :key="index" align="center">{{field.title}}</uni-th>
		</uni-tr>
		<uni-tr v-for="(item ,index) in data" :key="index">
			<uni-td v-for="(field, index) in filedsMap" :key="index" align="center">{{item[field.field]}}</uni-td>
		</uni-tr>
	</uni-table>
</template>

<script>
	export default {
		name: "uni-stat-table",
		data() {
			return {

			};
		},
		props: {
			data: {
				type: Array,
				default: () => {
					return []
				}
			},
			filedsMap: {
				type: Array,
				default: () => {
					return []
				}
			},
			loading: {
				type: Boolean,
				default: false
			}
		}
	}
</script>

<style>

</style>
